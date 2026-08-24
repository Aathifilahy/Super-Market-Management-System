using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.DTOs;
using SupermarketAPI.Models;

namespace SupermarketAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,InventoryManager")]
public class StockPurchasesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<StockPurchasesController> _logger;

    public StockPurchasesController(ApplicationDbContext dbContext, ILogger<StockPurchasesController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpPost]
    [ProducesResponseType(typeof(StockPurchaseResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<StockPurchaseResponseDto>> CreateStockPurchase([FromBody] CreateStockPurchaseDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (dto.Quantity <= 0 || dto.PurchasePrice <= 0)
        {
            return BadRequest(new { message = "Quantity and purchase price must be positive values." });
        }

        if (dto.ExpiryDate == default)
        {
            return BadRequest(new { message = "Expiry date is required." });
        }

        try
        {
            var supplier = await _dbContext.Suppliers.FirstOrDefaultAsync(s => s.Id == dto.SupplierId && s.IsActive);
            if (supplier is null)
            {
                return NotFound(new { message = "Supplier not found or inactive." });
            }

            var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product is null)
            {
                return NotFound(new { message = "Product not found." });
            }

            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            var purchase = new StockPurchase
            {
                SupplierId = supplier.Id,
                ProductId = product.Id,
                Quantity = dto.Quantity,
                PurchasePrice = dto.PurchasePrice,
                PurchaseDate = dto.PurchaseDate,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = GetCurrentUserId()
            };

            purchase.Id = await MongoIdGenerator.NextAsync(_dbContext.StockPurchases, sp => sp.Id);

            _dbContext.StockPurchases.Add(purchase);

            product.Quantity += dto.Quantity;
            product.ExpiryDate = dto.ExpiryDate;
            product.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            var response = new StockPurchaseResponseDto
            {
                Id = purchase.Id,
                SupplierId = supplier.Id,
                SupplierCompanyName = supplier.CompanyName,
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = purchase.Quantity,
                PurchasePrice = purchase.PurchasePrice,
                PurchaseDate = purchase.PurchaseDate,
                ExpiryDate = product.ExpiryDate,
                CreatedAt = purchase.CreatedAt,
                TotalCost = purchase.Quantity * purchase.PurchasePrice
            };

            return CreatedAtAction(nameof(GetStockPurchaseById), new { id = purchase.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while creating stock purchase.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<StockPurchaseResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<StockPurchaseResponseDto>>> GetPurchaseHistory(
        [FromQuery] int? supplierId = null,
        [FromQuery] int? productId = null)
    {
        try
        {
            var query = _dbContext.StockPurchases
                .AsNoTracking()
                .Include(sp => sp.Supplier)
                .Include(sp => sp.Product)
                .AsQueryable();

            if (supplierId.HasValue)
            {
                query = query.Where(sp => sp.SupplierId == supplierId.Value);
            }

            if (productId.HasValue)
            {
                query = query.Where(sp => sp.ProductId == productId.Value);
            }

            var purchases = await query
                .OrderByDescending(sp => sp.PurchaseDate)
                .ThenByDescending(sp => sp.Id)
                .Select(sp => new StockPurchaseResponseDto
                {
                    Id = sp.Id,
                    SupplierId = sp.SupplierId,
                    SupplierCompanyName = sp.Supplier != null ? sp.Supplier.CompanyName : string.Empty,
                    ProductId = sp.ProductId,
                    ProductName = sp.Product != null ? sp.Product.Name : string.Empty,
                    Quantity = sp.Quantity,
                    PurchasePrice = sp.PurchasePrice,
                    PurchaseDate = sp.PurchaseDate,
                    ExpiryDate = sp.Product != null ? sp.Product.ExpiryDate : default,
                    CreatedAt = sp.CreatedAt,
                    TotalCost = sp.Quantity * sp.PurchasePrice
                })
                .ToListAsync();

            return Ok(purchases);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching stock purchase history.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(StockPurchaseResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<StockPurchaseResponseDto>> GetStockPurchaseById(int id)
    {
        try
        {
            var purchase = await _dbContext.StockPurchases
                .AsNoTracking()
                .Include(sp => sp.Supplier)
                .Include(sp => sp.Product)
                .FirstOrDefaultAsync(sp => sp.Id == id);

            if (purchase is null)
            {
                return NotFound(new { message = "Stock purchase not found." });
            }

            var response = new StockPurchaseResponseDto
            {
                Id = purchase.Id,
                SupplierId = purchase.SupplierId,
                SupplierCompanyName = purchase.Supplier != null ? purchase.Supplier.CompanyName : string.Empty,
                ProductId = purchase.ProductId,
                ProductName = purchase.Product != null ? purchase.Product.Name : string.Empty,
                Quantity = purchase.Quantity,
                PurchasePrice = purchase.PurchasePrice,
                PurchaseDate = purchase.PurchaseDate,
                ExpiryDate = purchase.Product != null ? purchase.Product.ExpiryDate : default,
                CreatedAt = purchase.CreatedAt,
                TotalCost = purchase.Quantity * purchase.PurchasePrice
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching stock purchase {StockPurchaseId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    private int? GetCurrentUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(sub, out var userId) ? userId : null;
    }
}
