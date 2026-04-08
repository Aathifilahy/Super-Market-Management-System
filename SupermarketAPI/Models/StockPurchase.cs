using System.ComponentModel.DataAnnotations;

namespace SupermarketAPI.Models;

public class StockPurchase
{
    public int Id { get; set; }

    [Required]
    public int SupplierId { get; set; }

    public Supplier? Supplier { get; set; }

    [Required]
    public int ProductId { get; set; }

    public Product? Product { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal PurchasePrice { get; set; }

    [Required]
    public DateTime PurchaseDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? CreatedByUserId { get; set; }
}
