using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.Interfaces;
using SupermarketAPI.Models;
using SupermarketAPI.Models.DTOs;

namespace SupermarketAPI.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<OrderService> _logger;

    public OrderService(ApplicationDbContext dbContext, ILogger<OrderService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<OrderDetailDto> PlaceOrder(int userId, PlaceOrderDto dto)
    {
        try
        {
            await EnsureActiveUserExists(userId);

            var cart = await _dbContext.Carts
                .Include(c => c.Items)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive)
                ?? throw new KeyNotFoundException("Active cart not found.");

            if (cart.Items.Count == 0)
            {
                throw new InvalidOperationException("Cart is empty.");
            }

            foreach (var item in cart.Items)
            {
                var product = item.Product
                    ?? await _dbContext.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId)
                    ?? throw new KeyNotFoundException($"Product {item.ProductId} not found.");

                if (item.Quantity > product.Quantity)
                {
                    throw new InvalidOperationException($"Insufficient stock for product '{product.Name}'.");
                }
            }

            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = cart.Items.Sum(i => i.Quantity * i.Price),
                Status = OrderStatus.Pending,
                ShippingAddress = dto.ShippingAddress.Trim(),
                PaymentMethod = dto.PaymentMethod.Trim(),
                PaymentStatus = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Items = cart.Items.Select(item => new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    ProductName = item.Product?.Name ?? string.Empty,
                    ProductCategory = item.Product?.Category ?? string.Empty
                }).ToList()
            };

            order.Id = await MongoIdGenerator.NextAsync(_dbContext.Orders, o => o.Id);
            var nextOrderItemId = await MongoIdGenerator.NextAsync(_dbContext.OrderItems, oi => oi.Id);
            foreach (var (item, index) in order.Items.Select((item, index) => (item, index)))
            {
                item.Id = nextOrderItemId + index;
            }

            _dbContext.Orders.Add(order);

            foreach (var item in cart.Items)
            {
                var product = item.Product
                    ?? await _dbContext.Products.FirstAsync(p => p.Id == item.ProductId);

                product.Quantity -= item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
            }

            _dbContext.CartItems.RemoveRange(cart.Items);
            cart.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return await GetOrderDetails(userId, order.Id);
        }
        catch (Exception ex) when (ex is not ArgumentException && ex is not KeyNotFoundException && ex is not InvalidOperationException)
        {
            _logger.LogError(ex, "Error occurred while placing order for user {UserId}.", userId);
            throw;
        }
    }

    public async Task<IEnumerable<OrderDto>> GetUserOrders(int userId)
    {
        try
        {
            await EnsureActiveUserExists(userId);

            return await _dbContext.Orders
                .AsNoTracking()
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status.ToString(),
                    PaymentMethod = o.PaymentMethod,
                    PaymentStatus = o.PaymentStatus.ToString(),
                    TotalItems = o.Items.Sum(i => i.Quantity)
                })
                .ToListAsync();
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Error occurred while fetching orders for user {UserId}.", userId);
            throw;
        }
    }

    public async Task<OrderDetailDto> GetOrderDetails(int userId, int orderId)
    {
        try
        {
            await EnsureActiveUserExists(userId);

            var order = await _dbContext.Orders
                .AsNoTracking()
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId)
                ?? throw new KeyNotFoundException("Order not found.");

            return new OrderDetailDto
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(),
                ShippingAddress = order.ShippingAddress,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus.ToString(),
                CreatedAt = order.CreatedAt,
                Items = order.Items
                    .Select(item => new OrderItemDto
                    {
                        Id = item.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        Price = item.Price,
                        LineTotal = item.Quantity * item.Price,
                        ProductName = item.ProductName,
                        ProductCategory = item.ProductCategory
                    })
                    .ToList()
            };
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Error occurred while fetching order {OrderId} for user {UserId}.", orderId, userId);
            throw;
        }
    }

    private async Task EnsureActiveUserExists(int userId)
    {
        var userExists = await _dbContext.Users.AnyAsync(u => u.Id == userId && u.IsActive);
        if (!userExists)
        {
            throw new KeyNotFoundException("User not found or inactive.");
        }
    }
}