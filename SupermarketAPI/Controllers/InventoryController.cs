using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.DTOs;

namespace SupermarketAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,InventoryManager")]
public class InventoryController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<InventoryController> _logger;

    public InventoryController(ApplicationDbContext dbContext, ILogger<InventoryController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(InventoryDashboardSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<InventoryDashboardSummaryDto>> GetDashboardSummary()
    {
        try
        {
            var products = await _dbContext.Products.AsNoTracking().ToListAsync();
            var suppliersCount = await _dbContext.Suppliers.AsNoTracking().CountAsync(s => s.IsActive);
            var purchasesInLast30Days = await _dbContext.StockPurchases
                .AsNoTracking()
                .CountAsync(sp => sp.PurchaseDate >= DateTime.UtcNow.AddDays(-30));

            var summary = new InventoryDashboardSummaryDto
            {
                TotalProducts = products.Count,
                TotalSuppliers = suppliersCount,
                LowStockProducts = products.Count(p => p.Quantity < (p.LowStockThreshold.HasValue && p.LowStockThreshold.Value > 0 ? p.LowStockThreshold.Value : 10)),
                TotalStockUnits = products.Sum(p => p.Quantity),
                TotalInventoryValue = products.Sum(p => p.Price * p.Quantity),
                PurchasesInLast30Days = purchasesInLast30Days
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching inventory dashboard summary.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("low-stock")]
    [ProducesResponseType(typeof(IEnumerable<ProductResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetLowStockProducts([FromQuery] int? threshold = null)
    {
        if (threshold.HasValue && threshold.Value <= 0)
        {
            return BadRequest(new { message = "Threshold must be greater than zero." });
        }

        try
        {
            var products = await _dbContext.Products
                .AsNoTracking()
                .Where(p => p.Quantity < (threshold ?? (p.LowStockThreshold.HasValue && p.LowStockThreshold.Value > 0 ? p.LowStockThreshold.Value : 10)))
                .OrderBy(p => p.Quantity)
                .ThenBy(p => p.Name)
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Category = p.Category,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    LowStockThreshold = p.LowStockThreshold,
                    ExpiryDate = p.ExpiryDate,
                    ImageUrl = p.ImageUrl,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    IsLowStock = p.Quantity < (threshold ?? (p.LowStockThreshold.HasValue && p.LowStockThreshold.Value > 0 ? p.LowStockThreshold.Value : 10)),
                    IsExpired = p.ExpiryDate < DateTime.UtcNow
                })
                .ToListAsync();

            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching low stock products.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }
}
