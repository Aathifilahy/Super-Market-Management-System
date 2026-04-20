namespace SupermarketAPI.DTOs;

public class PosProductSearchItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int AvailableStock { get; set; }
    public string SimulatedBarcode { get; set; } = string.Empty;
    public bool IsOutOfStock { get; set; }
    public bool IsExpired { get; set; }
}

public class PosProductSearchResponseDto
{
    public string? Query { get; set; }
    public string? Category { get; set; }
    public string? Barcode { get; set; }
    public bool IncludeOutOfStock { get; set; }
    public int TotalResults { get; set; }
    public List<string> Categories { get; set; } = new();
    public List<PosProductSearchItemDto> Items { get; set; } = new();
}
