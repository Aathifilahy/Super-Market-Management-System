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
public class SuppliersController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<SuppliersController> _logger;

    public SuppliersController(ApplicationDbContext dbContext, ILogger<SuppliersController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SupplierResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<SupplierResponseDto>>> GetSuppliers([FromQuery] string? search = null)
    {
        try
        {
            var query = _dbContext.Suppliers.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLowerInvariant();
                query = query.Where(s =>
                    s.CompanyName.ToLower().Contains(term) ||
                    s.ContactPerson.ToLower().Contains(term) ||
                    s.Email.ToLower().Contains(term));
            }

            var suppliers = await query
                .OrderBy(s => s.CompanyName)
                .Select(s => ToSupplierResponse(s))
                .ToListAsync();

            return Ok(suppliers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching suppliers.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SupplierResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SupplierResponseDto>> GetSupplierById(int id)
    {
        try
        {
            var supplier = await _dbContext.Suppliers.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
            if (supplier is null)
            {
                return NotFound(new { message = "Supplier not found." });
            }

            return Ok(ToSupplierResponse(supplier));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching supplier {SupplierId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(SupplierResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SupplierResponseDto>> CreateSupplier([FromBody] CreateSupplierDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var normalizedCompanyName = dto.CompanyName.Trim().ToLowerInvariant();
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            var duplicate = await _dbContext.Suppliers
                .AsNoTracking()
                .AnyAsync(s =>
                    s.CompanyName.ToLower() == normalizedCompanyName ||
                    s.Email.ToLower() == normalizedEmail);

            if (duplicate)
            {
                return Conflict(new { message = "Supplier with the same company name or email already exists." });
            }

            var supplier = new Supplier
            {
                CompanyName = dto.CompanyName.Trim(),
                ContactPerson = dto.ContactPerson.Trim(),
                Email = normalizedEmail,
                Phone = dto.Phone.Trim(),
                Address = dto.Address.Trim(),
                TaxIdOrVatNumber = string.IsNullOrWhiteSpace(dto.TaxIdOrVatNumber) ? null : dto.TaxIdOrVatNumber.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Suppliers.Add(supplier);
            await _dbContext.SaveChangesAsync();

            var response = ToSupplierResponse(supplier);
            return CreatedAtAction(nameof(GetSupplierById), new { id = supplier.Id }, response);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error occurred while creating supplier {SupplierEmail}.", dto.Email);
            return Conflict(new { message = "Unable to create supplier. Duplicate data may exist." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while creating supplier {SupplierEmail}.", dto.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(SupplierResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SupplierResponseDto>> UpdateSupplier(int id, [FromBody] UpdateSupplierDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var supplier = await _dbContext.Suppliers.FirstOrDefaultAsync(s => s.Id == id);
            if (supplier is null)
            {
                return NotFound(new { message = "Supplier not found." });
            }

            var normalizedCompanyName = dto.CompanyName.Trim().ToLowerInvariant();
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            var duplicate = await _dbContext.Suppliers
                .AsNoTracking()
                .AnyAsync(s => s.Id != id &&
                               (s.CompanyName.ToLower() == normalizedCompanyName ||
                                s.Email.ToLower() == normalizedEmail));

            if (duplicate)
            {
                return Conflict(new { message = "Another supplier already uses this company name or email." });
            }

            supplier.CompanyName = dto.CompanyName.Trim();
            supplier.ContactPerson = dto.ContactPerson.Trim();
            supplier.Email = normalizedEmail;
            supplier.Phone = dto.Phone.Trim();
            supplier.Address = dto.Address.Trim();
            supplier.TaxIdOrVatNumber = string.IsNullOrWhiteSpace(dto.TaxIdOrVatNumber) ? null : dto.TaxIdOrVatNumber.Trim();
            supplier.IsActive = dto.IsActive ?? supplier.IsActive;
            supplier.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(ToSupplierResponse(supplier));
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error occurred while updating supplier {SupplierId}.", id);
            return Conflict(new { message = "Unable to update supplier. Duplicate data may exist." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while updating supplier {SupplierId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        try
        {
            var supplier = await _dbContext.Suppliers.FirstOrDefaultAsync(s => s.Id == id);
            if (supplier is null)
            {
                return NotFound(new { message = "Supplier not found." });
            }

            var hasPurchases = await _dbContext.StockPurchases.AsNoTracking().AnyAsync(sp => sp.SupplierId == id);
            if (hasPurchases)
            {
                return Conflict(new { message = "Supplier cannot be deleted because purchase history exists." });
            }

            _dbContext.Suppliers.Remove(supplier);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while deleting supplier {SupplierId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    private static SupplierResponseDto ToSupplierResponse(Supplier supplier)
    {
        return new SupplierResponseDto
        {
            Id = supplier.Id,
            CompanyName = supplier.CompanyName,
            ContactPerson = supplier.ContactPerson,
            Email = supplier.Email,
            Phone = supplier.Phone,
            Address = supplier.Address,
            TaxIdOrVatNumber = supplier.TaxIdOrVatNumber,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            UpdatedAt = supplier.UpdatedAt
        };
    }
}
