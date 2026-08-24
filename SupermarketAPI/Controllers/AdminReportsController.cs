using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.DTOs;
using SupermarketAPI.Models;

namespace SupermarketAPI.Controllers;

[ApiController]
[Route("api/admin/reports")]
[Authorize(Roles = "Admin")]
public class AdminReportsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<AdminReportsController> _logger;

    public AdminReportsController(ApplicationDbContext dbContext, ILogger<AdminReportsController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpGet("daily-sales")]
    [ProducesResponseType(typeof(DailySalesReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DailySalesReportDto>> GetDailySales(
        [FromQuery] DateTime? date = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? category = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? customer = null)
    {
        try
        {
            var normalized = NormalizeFilters(date, startDate, endDate, category, paymentMethod, customer, 0);
            if (normalized.ErrorResult is not null)
            {
                return normalized.ErrorResult;
            }

            var reportData = await LoadReportData(normalized);
            var filteredOrders = reportData.Orders;
            var filteredOrderItems = reportData.Items;

            var orderCount = normalized.HasCategory
                ? filteredOrderItems.Select(oi => oi.OrderId).Distinct().Count()
                : filteredOrders.Count;

            var totalSales = normalized.HasCategory
                ? filteredOrderItems.Sum(oi => (decimal)oi.Quantity * oi.Price)
                : filteredOrders.Sum(o => o.TotalAmount);

            var topProducts = filteredOrderItems
                .GroupBy(oi => new { oi.ProductId, oi.ProductName })
                .Select(group => new TopSellingProductDto
                {
                    ProductId = group.Key.ProductId,
                    ProductName = group.Key.ProductName,
                    QuantitySold = group.Sum(item => item.Quantity),
                    Revenue = group.Sum(item => item.Quantity * item.Price)
                })
                .OrderByDescending(item => item.QuantitySold)
                .ThenByDescending(item => item.Revenue)
                .Take(5)
                .ToList();

            return Ok(new DailySalesReportDto
            {
                Date = normalized.StartDate,
                StartDate = normalized.StartDate,
                EndDate = normalized.EndDate,
                TotalSales = totalSales,
                NumberOfOrders = orderCount,
                AverageOrderValue = orderCount == 0 ? 0m : totalSales / orderCount,
                Filters = normalized.ToDto(),
                TopSellingProducts = topProducts
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while generating daily sales report.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("daily-sales/export")]
    public async Task<IActionResult> ExportDailySalesCsv(
        [FromQuery] DateTime? date = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? category = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? customer = null)
    {
        var reportResult = await GetDailySales(date, startDate, endDate, category, paymentMethod, customer);
        if (reportResult.Result is not null)
        {
            return reportResult.Result;
        }

        var report = reportResult.Value!;
        var csv = new StringBuilder();
        csv.AppendLine("Metric,Value");
        csv.AppendLine($"Start Date,{FormatDate(report.StartDate)}");
        csv.AppendLine($"End Date,{FormatDate(report.EndDate)}");
        csv.AppendLine($"Category,{EscapeCsv(report.Filters.Category ?? "All")}");
        csv.AppendLine($"Payment Method,{EscapeCsv(report.Filters.PaymentMethod ?? "All")}");
        csv.AppendLine($"Customer,{EscapeCsv(report.Filters.Customer ?? "All")}");
        csv.AppendLine($"Total Sales,{report.TotalSales.ToString("0.00", CultureInfo.InvariantCulture)}");
        csv.AppendLine($"Orders,{report.NumberOfOrders}");
        csv.AppendLine($"Average Order Value,{report.AverageOrderValue.ToString("0.00", CultureInfo.InvariantCulture)}");
        csv.AppendLine();
        csv.AppendLine("Product,Quantity Sold,Revenue");

        foreach (var item in report.TopSellingProducts)
        {
            csv.AppendLine($"{EscapeCsv(item.ProductName)},{item.QuantitySold},{item.Revenue.ToString("0.00", CultureInfo.InvariantCulture)}");
        }

        return CsvFile(csv.ToString(), BuildFileName("daily-sales", report.StartDate, report.EndDate));
    }

    [HttpGet("monthly-revenue")]
    [ProducesResponseType(typeof(MonthlyRevenueReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MonthlyRevenueReportDto>> GetMonthlyRevenue(
        [FromQuery] int? year = null,
        [FromQuery] int? month = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? category = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? customer = null)
    {
        try
        {
            DateTime rangeStart;
            DateTime rangeEnd;

            if (startDate.HasValue || endDate.HasValue)
            {
                var normalized = NormalizeFilters(null, startDate, endDate, category, paymentMethod, customer, 29);
                if (normalized.ErrorResult is not null)
                {
                    return normalized.ErrorResult;
                }

                rangeStart = normalized.StartDate;
                rangeEnd = normalized.EndDate;

                var report = await BuildMonthlyRevenueReport(normalized, rangeStart.Year, rangeStart.Month);
                return Ok(report);
            }

            var now = DateTime.UtcNow;
            var targetYear = year ?? now.Year;
            var targetMonth = month ?? now.Month;

            if (targetMonth is < 1 or > 12)
            {
                return BadRequest(new { message = "Month must be between 1 and 12." });
            }

            rangeStart = new DateTime(targetYear, targetMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            rangeEnd = rangeStart.AddMonths(1).AddDays(-1);

            var monthlyFilters = NormalizeFilters(null, rangeStart, rangeEnd, category, paymentMethod, customer, 29);
            var monthlyReport = await BuildMonthlyRevenueReport(monthlyFilters, targetYear, targetMonth);

            return Ok(monthlyReport);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while generating monthly revenue report.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("monthly-revenue/export")]
    public async Task<IActionResult> ExportMonthlyRevenueCsv(
        [FromQuery] int? year = null,
        [FromQuery] int? month = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? category = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? customer = null)
    {
        var reportResult = await GetMonthlyRevenue(year, month, startDate, endDate, category, paymentMethod, customer);
        if (reportResult.Result is not null)
        {
            return reportResult.Result;
        }

        var report = reportResult.Value!;
        var csv = new StringBuilder();
        csv.AppendLine("Metric,Value");
        csv.AppendLine($"Start Date,{FormatDate(report.StartDate)}");
        csv.AppendLine($"End Date,{FormatDate(report.EndDate)}");
        csv.AppendLine($"Category,{EscapeCsv(report.Filters.Category ?? "All")}");
        csv.AppendLine($"Payment Method,{EscapeCsv(report.Filters.PaymentMethod ?? "All")}");
        csv.AppendLine($"Customer,{EscapeCsv(report.Filters.Customer ?? "All")}");
        csv.AppendLine($"Monthly Total,{report.MonthlyTotal.ToString("0.00", CultureInfo.InvariantCulture)}");
        csv.AppendLine();
        csv.AppendLine("Date,Revenue,Orders");

        foreach (var point in report.DailyBreakdown)
        {
            csv.AppendLine($"{FormatDate(point.Date)},{point.Revenue.ToString("0.00", CultureInfo.InvariantCulture)},{point.Orders}");
        }

        return CsvFile(csv.ToString(), BuildFileName("monthly-revenue", report.StartDate, report.EndDate));
    }

    [HttpGet("top-products")]
    [ProducesResponseType(typeof(TopSellingProductsReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<TopSellingProductsReportDto>> GetTopSellingProducts(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int topN = 10,
        [FromQuery] string sortBy = "quantity",
        [FromQuery] string? category = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? customer = null)
    {
        try
        {
            if (topN < 1 || topN > 100)
            {
                return BadRequest(new { message = "topN must be between 1 and 100." });
            }

            var normalized = NormalizeFilters(null, startDate, endDate, category, paymentMethod, customer, 29);
            if (normalized.ErrorResult is not null)
            {
                return normalized.ErrorResult;
            }

            var normalizedSort = string.Equals(sortBy, "revenue", StringComparison.OrdinalIgnoreCase)
                ? "revenue"
                : "quantity";

            var reportData = await LoadReportData(normalized);
            var query = reportData.Items
                .GroupBy(oi => new { oi.ProductId, oi.ProductName })
                .Select(group => new TopSellingProductDto
                {
                    ProductId = group.Key.ProductId,
                    ProductName = group.Key.ProductName,
                    QuantitySold = group.Sum(item => item.Quantity),
                    Revenue = group.Sum(item => item.Quantity * item.Price)
                });

            var sorted = normalizedSort == "revenue"
                ? query.OrderByDescending(item => item.Revenue).ThenByDescending(item => item.QuantitySold)
                : query.OrderByDescending(item => item.QuantitySold).ThenByDescending(item => item.Revenue);

            var items = sorted.Take(topN).ToList();

            return Ok(new TopSellingProductsReportDto
            {
                StartDate = normalized.StartDate,
                EndDate = normalized.EndDate,
                TopN = topN,
                SortBy = normalizedSort,
                Filters = normalized.ToDto(),
                Items = items
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while generating top-selling products report.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("top-products/export")]
    public async Task<IActionResult> ExportTopProductsCsv(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int topN = 10,
        [FromQuery] string sortBy = "quantity",
        [FromQuery] string? category = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? customer = null)
    {
        var reportResult = await GetTopSellingProducts(startDate, endDate, topN, sortBy, category, paymentMethod, customer);
        if (reportResult.Result is not null)
        {
            return reportResult.Result;
        }

        var report = reportResult.Value!;
        var csv = new StringBuilder();
        csv.AppendLine("Product,Quantity Sold,Revenue");
        foreach (var item in report.Items)
        {
            csv.AppendLine($"{EscapeCsv(item.ProductName)},{item.QuantitySold},{item.Revenue.ToString("0.00", CultureInfo.InvariantCulture)}");
        }

        return CsvFile(csv.ToString(), BuildFileName("top-products", report.StartDate, report.EndDate));
    }

    [HttpGet("order-summary")]
    [ProducesResponseType(typeof(OrderSummaryReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<OrderSummaryReportDto>> GetOrderSummary(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? category = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? customer = null)
    {
        try
        {
            var normalized = NormalizeFilters(null, startDate, endDate, category, paymentMethod, customer, 29);
            if (normalized.ErrorResult is not null)
            {
                return normalized.ErrorResult;
            }

            var reportData = await LoadReportData(normalized);
            var items = reportData.Orders
                .GroupBy(o => o.Status)
                .Select(group => new OrderStatusSummaryItemDto
                {
                    Status = group.Key.ToString(),
                    Count = group.Count(),
                    TotalValue = group.Sum(order => order.TotalAmount)
                })
                .OrderBy(item => item.Status)
                .ToList();

            return Ok(new OrderSummaryReportDto
            {
                StartDate = normalized.StartDate,
                EndDate = normalized.EndDate,
                Filters = normalized.ToDto(),
                Items = items
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while generating order summary report.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("order-summary/export")]
    public async Task<IActionResult> ExportOrderSummaryCsv(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? category = null,
        [FromQuery] string? paymentMethod = null,
        [FromQuery] string? customer = null)
    {
        var reportResult = await GetOrderSummary(startDate, endDate, category, paymentMethod, customer);
        if (reportResult.Result is not null)
        {
            return reportResult.Result;
        }

        var report = reportResult.Value!;
        var csv = new StringBuilder();
        csv.AppendLine("Status,Count,Total Value");
        foreach (var item in report.Items)
        {
            csv.AppendLine($"{EscapeCsv(item.Status)},{item.Count},{item.TotalValue.ToString("0.00", CultureInfo.InvariantCulture)}");
        }

        return CsvFile(csv.ToString(), BuildFileName("order-summary", report.StartDate, report.EndDate));
    }

    private async Task<(List<Order> Orders, List<OrderItem> Items)> LoadReportData(ReportFilters filters)
    {
        var orders = await _dbContext.Orders
            .AsNoTracking()
            .Where(o => o.OrderDate >= filters.StartDate && o.OrderDate < filters.EndExclusive)
            .Where(o => o.PaymentStatus == PaymentStatus.Paid && o.Status != OrderStatus.Cancelled)
            .ToListAsync();

        if (!string.IsNullOrWhiteSpace(filters.PaymentMethod))
        {
            orders = orders
                .Where(o => string.Equals(o.PaymentMethod, filters.PaymentMethod, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(filters.Customer))
        {
            var customerTerm = filters.Customer.Trim();
            var users = await _dbContext.Users.AsNoTracking().ToListAsync();
            var matchingUserIds = users
                .Where(u => u.Name.Contains(customerTerm, StringComparison.OrdinalIgnoreCase) ||
                            u.Email.Contains(customerTerm, StringComparison.OrdinalIgnoreCase))
                .Select(u => u.Id)
                .ToHashSet();
            orders = orders.Where(o => matchingUserIds.Contains(o.UserId)).ToList();
        }

        var orderIds = orders.Select(o => o.Id).ToHashSet();
        var items = (await _dbContext.OrderItems.AsNoTracking().ToListAsync())
            .Where(item => orderIds.Contains(item.OrderId))
            .ToList();

        if (!string.IsNullOrWhiteSpace(filters.Category))
        {
            items = items
                .Where(item => string.Equals(item.ProductCategory, filters.Category, StringComparison.OrdinalIgnoreCase))
                .ToList();
            var filteredOrderIds = items.Select(item => item.OrderId).ToHashSet();
            orders = orders.Where(order => filteredOrderIds.Contains(order.Id)).ToList();
        }

        return (orders, items);
    }

    private async Task<MonthlyRevenueReportDto> BuildMonthlyRevenueReport(ReportFilters filters, int year, int month)
    {
        var reportData = await LoadReportData(filters);
        var filteredOrders = reportData.Orders;
        var filteredOrderItems = reportData.Items;

        var monthlyTotal = filters.HasCategory
            ? filteredOrderItems.Sum(oi => (decimal)oi.Quantity * oi.Price)
            : filteredOrders.Sum(o => o.TotalAmount);

        var dailyBreakdown = filters.HasCategory
            ? filteredOrderItems
                .GroupBy(oi => filteredOrders.First(order => order.Id == oi.OrderId).OrderDate.Date)
                .Select(group => new DailyRevenuePointDto
                {
                    Date = group.Key,
                    Revenue = group.Sum(item => item.Quantity * item.Price),
                    Orders = group.Select(item => item.OrderId).Distinct().Count()
                })
                .OrderBy(point => point.Date)
                .ToList()
            : filteredOrders
                .GroupBy(o => o.OrderDate.Date)
                .Select(group => new DailyRevenuePointDto
                {
                    Date = group.Key,
                    Revenue = group.Sum(order => order.TotalAmount),
                    Orders = group.Count()
                })
                .OrderBy(point => point.Date)
                .ToList();

        return new MonthlyRevenueReportDto
        {
            Year = year,
            Month = month,
            StartDate = filters.StartDate,
            EndDate = filters.EndDate,
            MonthlyTotal = monthlyTotal,
            Filters = filters.ToDto(),
            DailyBreakdown = dailyBreakdown
        };
    }

    private static ReportFilters NormalizeFilters(
        DateTime? date,
        DateTime? startDate,
        DateTime? endDate,
        string? category,
        string? paymentMethod,
        string? customer,
        int fallbackRangeDays)
    {
        var normalizedStart = date?.Date ?? startDate?.Date ?? DateTime.UtcNow.AddDays(-fallbackRangeDays).Date;
        var normalizedEnd = date?.Date ?? endDate?.Date ?? DateTime.UtcNow.Date;

        if (normalizedStart > normalizedEnd)
        {
            return ReportFilters.Invalid(new BadRequestObjectResult(new { message = "startDate must be earlier than or equal to endDate." }));
        }

        return new ReportFilters
        {
            StartDate = normalizedStart,
            EndDate = normalizedEnd,
            EndExclusive = normalizedEnd.AddDays(1),
            Category = string.IsNullOrWhiteSpace(category) ? null : category.Trim(),
            PaymentMethod = string.IsNullOrWhiteSpace(paymentMethod) ? null : paymentMethod.Trim(),
            Customer = string.IsNullOrWhiteSpace(customer) ? null : customer.Trim()
        };
    }

    private static FileContentResult CsvFile(string content, string fileName)
    {
        return new FileContentResult(Encoding.UTF8.GetBytes(content), "text/csv")
        {
            FileDownloadName = fileName
        };
    }

    private static string BuildFileName(string reportType, DateTime startDate, DateTime endDate)
    {
        return $"{reportType}-{startDate:yyyyMMdd}-{endDate:yyyyMMdd}.csv";
    }

    private static string EscapeCsv(string value)
    {
        return $"\"{value.Replace("\"", "\"\"")}\"";
    }

    private static string FormatDate(DateTime value)
    {
        return value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }

    private sealed class ReportFilters
    {
        public DateTime StartDate { get; init; }
        public DateTime EndDate { get; init; }
        public DateTime EndExclusive { get; init; }
        public string? Category { get; init; }
        public string? PaymentMethod { get; init; }
        public string? Customer { get; init; }
        public BadRequestObjectResult? ErrorResult { get; init; }
        public bool HasCategory => !string.IsNullOrWhiteSpace(Category);

        public ReportFilterSummaryDto ToDto()
        {
            return new ReportFilterSummaryDto
            {
                StartDate = StartDate,
                EndDate = EndDate,
                Category = Category,
                PaymentMethod = PaymentMethod,
                Customer = Customer
            };
        }

        public static ReportFilters Invalid(BadRequestObjectResult errorResult)
        {
            return new ReportFilters
            {
                ErrorResult = errorResult,
                EndExclusive = DateTime.UtcNow
            };
        }
    }
}
