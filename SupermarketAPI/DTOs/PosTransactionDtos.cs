using System.ComponentModel.DataAnnotations;

namespace SupermarketAPI.DTOs;

public class PosCheckoutItemDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}

public class PosCheckoutRequestDto
{
    [Required]
    [MinLength(1)]
    public List<PosCheckoutItemDto> Items { get; set; } = new();

    [Required]
    [StringLength(20)]
    public string PaymentMethod { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? AmountTendered { get; set; }

    public bool SimulateCardApproval { get; set; } = true;
}

public class PosReceiptItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class PosReceiptDto
{
    public int OrderId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime TransactionDateUtc { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public string CashierName { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
    public decimal? AmountTendered { get; set; }
    public decimal? ChangeGiven { get; set; }
    public string? CardAuthorizationCode { get; set; }
    public List<PosReceiptItemDto> Items { get; set; } = new();
}

public class PosTransactionHistoryItemDto
{
    public int OrderId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime TransactionDateUtc { get; set; }
    public string CashierName { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int TotalItems { get; set; }
}
