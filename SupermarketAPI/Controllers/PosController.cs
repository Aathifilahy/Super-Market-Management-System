using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.DTOs;
using SupermarketAPI.Interfaces;

namespace SupermarketAPI.Controllers;

[ApiController]
[Route("api/pos")]
[Authorize(Roles = "Cashier,Admin")]
public class PosController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IPosService _posService;
    private readonly ILogger<PosController> _logger;

    public PosController(ApplicationDbContext dbContext, IPosService posService, ILogger<PosController> logger)
    {
        _dbContext = dbContext;
        _posService = posService;
        _logger = logger;
    }

    [HttpGet("products/search")]
    [ProducesResponseType(typeof(PosProductSearchResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PosProductSearchResponseDto>> SearchProducts(
        [FromQuery] string? q = null,
        [FromQuery] string? category = null,
        [FromQuery] string? barcode = null,
        [FromQuery] bool includeOutOfStock = false)
    {
        try
        {
            var normalizedQuery = string.IsNullOrWhiteSpace(q) ? null : q.Trim().ToLowerInvariant();
            var normalizedCategory = string.IsNullOrWhiteSpace(category) ? null : category.Trim();
            var normalizedBarcode = string.IsNullOrWhiteSpace(barcode) ? null : barcode.Trim();
            var utcNow = DateTime.UtcNow;

            var query = _dbContext.Products
                .AsNoTracking()
                .AsQueryable();

            var parsedBarcodeFromQuery = !string.IsNullOrWhiteSpace(normalizedQuery) &&
                TryParseBarcodeId(normalizedQuery, out var queryBarcodeId)
                ? queryBarcodeId
                : (int?)null;

            if (!string.IsNullOrWhiteSpace(normalizedCategory))
            {
                query = query.Where(p => p.Category == normalizedCategory);
            }

            if (!string.IsNullOrWhiteSpace(normalizedQuery))
            {
                query = query.Where(p =>
                    p.Name.ToLower().Contains(normalizedQuery) ||
                    p.Category.ToLower().Contains(normalizedQuery) ||
                    (parsedBarcodeFromQuery.HasValue && p.Id == parsedBarcodeFromQuery.Value));
            }

            if (!string.IsNullOrWhiteSpace(normalizedBarcode))
            {
                if (TryParseBarcodeId(normalizedBarcode, out var barcodeId))
                {
                    query = query.Where(p => p.Id == barcodeId);
                }
                else
                {
                    query = query.Where(p => false);
                }
            }

            if (!includeOutOfStock)
            {
                query = query.Where(p => p.Quantity > 0);
            }

            var categories = await _dbContext.Products
                .AsNoTracking()
                .Select(p => p.Category)
                .Distinct()
                .OrderBy(value => value)
                .ToListAsync();

            var items = (await query
                .OrderBy(p => p.Quantity <= 0)
                .ThenBy(p => p.Name)
                .Take(50)
                .Select(p => new
                {
                    Id = p.Id,
                    Name = p.Name,
                    Category = p.Category,
                    Price = p.Price,
                    AvailableStock = p.Quantity,
                    IsOutOfStock = p.Quantity <= 0,
                    IsExpired = p.ExpiryDate < utcNow
                })
                .ToListAsync())
                .Select(p => new PosProductSearchItemDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Category = p.Category,
                    Price = p.Price,
                    AvailableStock = p.AvailableStock,
                    SimulatedBarcode = FormatBarcode(p.Id),
                    IsOutOfStock = p.IsOutOfStock,
                    IsExpired = p.IsExpired
                })
                .ToList();

            return Ok(new PosProductSearchResponseDto
            {
                Query = q,
                Category = normalizedCategory,
                Barcode = barcode,
                IncludeOutOfStock = includeOutOfStock,
                TotalResults = items.Count,
                Categories = categories,
                Items = items
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while searching POS products.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpPost("checkout")]
    [ProducesResponseType(typeof(PosReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PosReceiptDto>> Checkout([FromBody] PosCheckoutRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var cashierUserId = GetCurrentUserId();
        if (!cashierUserId.HasValue)
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        try
        {
            var receipt = await _posService.CheckoutAsync(cashierUserId.Value, dto);
            return Ok(receipt);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred during POS checkout for user {CashierUserId}.", cashierUserId.Value);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("receipts/{orderId:int}")]
    [ProducesResponseType(typeof(PosReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PosReceiptDto>> GetReceipt(int orderId)
    {
        var cashierUserId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");

        if (!cashierUserId.HasValue && !isAdmin)
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        try
        {
            var receipt = await _posService.GetReceiptAsync(orderId, cashierUserId, isAdmin);
            return Ok(receipt);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching POS receipt {OrderId}.", orderId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("transactions/recent")]
    [ProducesResponseType(typeof(IEnumerable<PosTransactionHistoryItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<PosTransactionHistoryItemDto>>> GetRecentTransactions([FromQuery] int limit = 10)
    {
        var cashierUserId = GetCurrentUserId();
        if (!cashierUserId.HasValue)
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        try
        {
            var items = await _posService.GetRecentTransactionsAsync(cashierUserId.Value, limit);
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching recent POS transactions for user {CashierUserId}.", cashierUserId.Value);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    private static string FormatBarcode(int productId)
    {
        return $"POS-{productId:D6}";
    }

    private static bool TryParseBarcodeId(string value, out int productId)
    {
        productId = 0;

        if (int.TryParse(value, out var numericId))
        {
            productId = numericId;
            return true;
        }

        var normalized = value.Trim();
        if (!normalized.StartsWith("POS-", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return int.TryParse(normalized["POS-".Length..], out productId);
    }

    private int? GetCurrentUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(sub, out var userId) ? userId : null;
    }
}
