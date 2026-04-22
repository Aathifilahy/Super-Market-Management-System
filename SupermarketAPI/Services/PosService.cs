using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.DTOs;
using SupermarketAPI.Interfaces;
using SupermarketAPI.Models;

namespace SupermarketAPI.Services;

public class PosService : IPosService
{
    private const string PosShippingAddress = "In-store POS";
    private const string StoreName = "Supermarket Management Store";

    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<PosService> _logger;

    public PosService(ApplicationDbContext dbContext, ILogger<PosService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<PosReceiptDto> CheckoutAsync(int cashierUserId, PosCheckoutRequestDto dto)
    {
        try
        {
            var cashier = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == cashierUserId && u.IsActive)
                ?? throw new KeyNotFoundException("Cashier account was not found.");

            var normalizedMethod = NormalizePaymentMethod(dto.PaymentMethod);
            var groupedItems = dto.Items
                .GroupBy(item => item.ProductId)
                .Select(group => new PosCheckoutItemDto
                {
                    ProductId = group.Key,
                    Quantity = group.Sum(item => item.Quantity)
                })
                .ToList();

            if (groupedItems.Count == 0)
            {
                throw new ArgumentException("At least one item is required for checkout.");
            }

            var productIds = groupedItems.Select(item => item.ProductId).Distinct().ToList();
            var products = await _dbContext.Products
                .Where(product => productIds.Contains(product.Id))
                .ToDictionaryAsync(product => product.Id);

            foreach (var item in groupedItems)
            {
                if (!products.TryGetValue(item.ProductId, out var product))
                {
                    throw new KeyNotFoundException($"Product {item.ProductId} was not found.");
                }

                if (item.Quantity <= 0)
                {
                    throw new ArgumentException("Item quantity must be at least 1.");
                }

                if (item.Quantity > product.Quantity)
                {
                    throw new InvalidOperationException($"Insufficient stock for product '{product.Name}'.");
                }

                if (product.ExpiryDate < DateTime.UtcNow)
                {
                    throw new InvalidOperationException($"Product '{product.Name}' is expired and cannot be sold.");
                }
            }

            var subtotal = groupedItems.Sum(item => products[item.ProductId].Price * item.Quantity);
            decimal? amountTendered = normalizedMethod == "Cash" ? dto.AmountTendered : null;
            decimal? changeGiven = normalizedMethod == "Cash" ? CalculateChange(subtotal, amountTendered) : null;

            if (normalizedMethod == "Card" && !dto.SimulateCardApproval)
            {
                throw new InvalidOperationException("Card authorization was declined.");
            }

            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            var order = new Order
            {
                UserId = cashierUserId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = subtotal,
                Status = OrderStatus.Confirmed,
                ShippingAddress = PosShippingAddress,
                PaymentMethod = normalizedMethod,
                PaymentStatus = PaymentStatus.Paid,
                CreatedAt = DateTime.UtcNow,
                Items = groupedItems.Select(item =>
                {
                    var product = products[item.ProductId];

                    return new OrderItem
                    {
                        ProductId = product.Id,
                        Quantity = item.Quantity,
                        Price = product.Price,
                        ProductName = product.Name,
                        ProductCategory = product.Category
                    };
                }).ToList()
            };

            _dbContext.Orders.Add(order);

            foreach (var item in groupedItems)
            {
                var product = products[item.ProductId];
                product.Quantity -= item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
            }

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return BuildReceipt(order, cashier.Name, amountTendered, changeGiven, normalizedMethod == "Card");
        }
        catch (Exception ex) when (ex is not ArgumentException && ex is not InvalidOperationException && ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Unexpected error occurred while completing POS checkout for user {CashierUserId}.", cashierUserId);
            throw;
        }
    }

    public async Task<PosReceiptDto> GetReceiptAsync(int orderId, int? cashierUserId, bool isAdmin)
    {
        try
        {
            var order = await _dbContext.Orders
                .AsNoTracking()
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId)
                ?? throw new KeyNotFoundException("Receipt not found.");

            if (!string.Equals(order.ShippingAddress, PosShippingAddress, StringComparison.Ordinal))
            {
                throw new KeyNotFoundException("Receipt not found.");
            }

            if (!isAdmin && (!cashierUserId.HasValue || order.UserId != cashierUserId.Value))
            {
                throw new UnauthorizedAccessException("You are not allowed to view this receipt.");
            }

            var cashierName = await _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Id == order.UserId)
                .Select(u => u.Name)
                .FirstOrDefaultAsync()
                ?? "Cashier";

            return BuildReceipt(order, cashierName, null, null, string.Equals(order.PaymentMethod, "Card", StringComparison.OrdinalIgnoreCase));
        }
        catch (Exception ex) when (ex is not KeyNotFoundException && ex is not UnauthorizedAccessException)
        {
            _logger.LogError(ex, "Unexpected error occurred while loading POS receipt {OrderId}.", orderId);
            throw;
        }
    }

    public async Task<IReadOnlyList<PosTransactionHistoryItemDto>> GetRecentTransactionsAsync(int cashierUserId, int limit)
    {
        try
        {
            var safeLimit = Math.Clamp(limit, 1, 25);

            var cashierName = await _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Id == cashierUserId)
                .Select(u => u.Name)
                .FirstOrDefaultAsync()
                ?? "Cashier";

            return await _dbContext.Orders
                .AsNoTracking()
                .Where(o => o.UserId == cashierUserId)
                .Where(o => o.PaymentStatus == PaymentStatus.Paid)
                .Where(o => o.Status != OrderStatus.Cancelled)
                .Where(o => o.ShippingAddress == PosShippingAddress)
                .OrderByDescending(o => o.OrderDate)
                .Take(safeLimit)
                .Select(o => new PosTransactionHistoryItemDto
                {
                    OrderId = o.Id,
                    ReceiptNumber = BuildReceiptNumber(o.Id),
                    TransactionDateUtc = o.OrderDate,
                    CashierName = cashierName,
                    PaymentMethod = o.PaymentMethod,
                    Total = o.TotalAmount,
                    TotalItems = o.Items.Sum(i => i.Quantity)
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while loading recent POS transactions for user {CashierUserId}.", cashierUserId);
            throw;
        }
    }

    private static string NormalizePaymentMethod(string paymentMethod)
    {
        var normalized = paymentMethod.Trim().ToLowerInvariant();

        return normalized switch
        {
            "cash" => "Cash",
            "card" => "Card",
            _ => throw new ArgumentException("Payment method must be Cash or Card.")
        };
    }

    private static decimal CalculateChange(decimal total, decimal? amountTendered)
    {
        if (!amountTendered.HasValue)
        {
            throw new ArgumentException("Amount tendered is required for cash payments.");
        }

        if (amountTendered.Value < total)
        {
            throw new InvalidOperationException("Amount tendered is insufficient for this sale.");
        }

        return amountTendered.Value - total;
    }

    private static PosReceiptDto BuildReceipt(
        Order order,
        string cashierName,
        decimal? amountTendered,
        decimal? changeGiven,
        bool isCardPayment)
    {
        return new PosReceiptDto
        {
            OrderId = order.Id,
            ReceiptNumber = BuildReceiptNumber(order.Id),
            TransactionDateUtc = order.OrderDate,
            StoreName = StoreName,
            CashierName = cashierName,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus.ToString(),
            Subtotal = order.TotalAmount,
            Total = order.TotalAmount,
            AmountTendered = amountTendered,
            ChangeGiven = changeGiven,
            CardAuthorizationCode = isCardPayment ? BuildCardAuthorizationCode(order.Id) : null,
            Items = order.Items
                .OrderBy(item => item.ProductName)
                .Select(item => new PosReceiptItemDto
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Quantity = item.Quantity,
                    UnitPrice = item.Price,
                    LineTotal = item.Quantity * item.Price
                })
                .ToList()
        };
    }

    private static string BuildReceiptNumber(int orderId)
    {
        return $"POS-{orderId:D6}";
    }

    private static string BuildCardAuthorizationCode(int orderId)
    {
        return $"AUTH-{orderId:D6}";
    }
}
