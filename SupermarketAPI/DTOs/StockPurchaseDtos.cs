using System.ComponentModel.DataAnnotations;

namespace SupermarketAPI.DTOs;

public class CreateStockPurchaseDto
{
    [Required]
    public int SupplierId { get; set; }

    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal PurchasePrice { get; set; }

    [Required]
    public DateTime PurchaseDate { get; set; }

    [Required]
    public DateTime ExpiryDate { get; set; }
}

public class StockPurchaseResponseDto
{
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public string SupplierCompanyName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public DateTime PurchaseDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal TotalCost { get; set; }
}

public class InventoryDashboardSummaryDto
{
    public int TotalProducts { get; set; }
    public int TotalSuppliers { get; set; }
    public int LowStockProducts { get; set; }
    public int TotalStockUnits { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int PurchasesInLast30Days { get; set; }
}
