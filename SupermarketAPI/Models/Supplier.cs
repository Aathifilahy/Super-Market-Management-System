using System.ComponentModel.DataAnnotations;

namespace SupermarketAPI.Models;

public class Supplier
{
    public int Id { get; set; }

    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string ContactPerson { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^[0-9+()\-\s]{7,20}$", ErrorMessage = "Phone number must be 7-20 characters and contain only digits, spaces, and + ( ) - symbols.")]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Address { get; set; } = string.Empty;

    [StringLength(50)]
    public string? TaxIdOrVatNumber { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<StockPurchase> StockPurchases { get; set; } = new List<StockPurchase>();
}
