namespace SupermarketAPI.DTOs;

public class DailySalesReportDto
{
    public DateTime Date { get; set; }
    public decimal TotalSales { get; set; }
    public int NumberOfOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public List<TopSellingProductDto> TopSellingProducts { get; set; } = new();
}

public class MonthlyRevenueReportDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal MonthlyTotal { get; set; }
    public List<DailyRevenuePointDto> DailyBreakdown { get; set; } = new();
}

public class DailyRevenuePointDto
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
}

public class TopSellingProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
}

public class TopSellingProductsReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TopN { get; set; }
    public string SortBy { get; set; } = "quantity";
    public List<TopSellingProductDto> Items { get; set; } = new();
}

public class OrderStatusSummaryItemDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalValue { get; set; }
}

public class OrderSummaryReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<OrderStatusSummaryItemDto> Items { get; set; } = new();
}
