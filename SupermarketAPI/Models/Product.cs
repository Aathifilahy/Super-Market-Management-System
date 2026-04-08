using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SupermarketAPI.Models;

public class Product
{
    public int Id { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Price { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(1, int.MaxValue)]
    public int? LowStockThreshold { get; set; }

    [Required]
    public DateTime ExpiryDate { get; set; }

    [Url]
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [NotMapped]
    public bool IsLowStock => Quantity < (LowStockThreshold.HasValue && LowStockThreshold.Value > 0 ? LowStockThreshold.Value : 10);

    [NotMapped]
    public bool IsExpired => ExpiryDate < DateTime.UtcNow;
}
