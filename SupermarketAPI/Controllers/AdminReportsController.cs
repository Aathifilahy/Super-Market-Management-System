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
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DailySalesReportDto>> GetDailySales([FromQuery] DateTime? date = null)
    {
        try
        {
            var day = (date ?? DateTime.UtcNow).Date;
            var dayEnd = day.AddDays(1);

            var dayOrders = _dbContext.Orders
                .AsNoTracking()
                .Where(o => o.OrderDate >= day && o.OrderDate < dayEnd)
                .Where(o => o.PaymentStatus == PaymentStatus.Paid && o.Status != OrderStatus.Cancelled);

            var orderCount = await dayOrders.CountAsync();
            var totalSales = await dayOrders.SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

            var topProducts = await _dbContext.OrderItems
                .AsNoTracking()
                .Where(oi => oi.Order != null &&
                             oi.Order.OrderDate >= day &&
                             oi.Order.OrderDate < dayEnd &&
                             oi.Order.PaymentStatus == PaymentStatus.Paid &&
                             oi.Order.Status != OrderStatus.Cancelled)
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
                .ToListAsync();

            var report = new DailySalesReportDto
            {
                Date = day,
                TotalSales = totalSales,
                NumberOfOrders = orderCount,
                AverageOrderValue = orderCount == 0 ? 0m : totalSales / orderCount,
                TopSellingProducts = topProducts
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while generating daily sales report.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("monthly-revenue")]
    [ProducesResponseType(typeof(MonthlyRevenueReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MonthlyRevenueReportDto>> GetMonthlyRevenue(
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        try
        {
            var now = DateTime.UtcNow;
            var targetYear = year ?? now.Year;
            var targetMonth = month ?? now.Month;

            if (targetMonth is < 1 or > 12)
            {
                return BadRequest(new { message = "Month must be between 1 and 12." });
            }

            var startDate = new DateTime(targetYear, targetMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1);

            var monthOrders = _dbContext.Orders
                .AsNoTracking()
                .Where(o => o.OrderDate >= startDate && o.OrderDate < endDate)
                .Where(o => o.PaymentStatus == PaymentStatus.Paid && o.Status != OrderStatus.Cancelled);

            var monthlyTotal = await monthOrders.SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

            var dailyBreakdown = await monthOrders
                .GroupBy(o => o.OrderDate.Date)
                .Select(group => new DailyRevenuePointDto
                {
                    Date = group.Key,
                    Revenue = group.Sum(order => order.TotalAmount),
                    Orders = group.Count()
                })
                .OrderBy(point => point.Date)
                .ToListAsync();

            return Ok(new MonthlyRevenueReportDto
            {
                Year = targetYear,
                Month = targetMonth,
                MonthlyTotal = monthlyTotal,
                DailyBreakdown = dailyBreakdown
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while generating monthly revenue report.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("top-products")]
    [ProducesResponseType(typeof(TopSellingProductsReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<TopSellingProductsReportDto>> GetTopSellingProducts(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int topN = 10,
        [FromQuery] string sortBy = "quantity")
    {
        try
        {
            if (topN < 1 || topN > 100)
            {
                return BadRequest(new { message = "topN must be between 1 and 100." });
            }

            var start = (startDate ?? DateTime.UtcNow.AddDays(-30)).Date;
            var endInclusive = (endDate ?? DateTime.UtcNow).Date;
            var endExclusive = endInclusive.AddDays(1);

            if (start > endInclusive)
            {
                return BadRequest(new { message = "startDate must be earlier than or equal to endDate." });
            }

            var normalizedSort = string.Equals(sortBy, "revenue", StringComparison.OrdinalIgnoreCase)
                ? "revenue"
                : "quantity";

            var query = _dbContext.OrderItems
                .AsNoTracking()
                .Where(oi => oi.Order != null &&
                             oi.Order.OrderDate >= start &&
                             oi.Order.OrderDate < endExclusive &&
                             oi.Order.PaymentStatus == PaymentStatus.Paid &&
                             oi.Order.Status != OrderStatus.Cancelled)
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

            var items = await sorted.Take(topN).ToListAsync();

            return Ok(new TopSellingProductsReportDto
            {
                StartDate = start,
                EndDate = endInclusive,
                TopN = topN,
                SortBy = normalizedSort,
                Items = items
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while generating top-selling products report.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("order-summary")]
    [ProducesResponseType(typeof(OrderSummaryReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<OrderSummaryReportDto>> GetOrderSummary(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var start = (startDate ?? DateTime.UtcNow.AddDays(-30)).Date;
            var endInclusive = (endDate ?? DateTime.UtcNow).Date;
            var endExclusive = endInclusive.AddDays(1);

            if (start > endInclusive)
            {
                return BadRequest(new { message = "startDate must be earlier than or equal to endDate." });
            }

            var items = await _dbContext.Orders
                .AsNoTracking()
                .Where(o => o.OrderDate >= start && o.OrderDate < endExclusive)
                .GroupBy(o => o.Status)
                .Select(group => new OrderStatusSummaryItemDto
                {
                    Status = group.Key.ToString(),
                    Count = group.Count(),
                    TotalValue = group.Sum(order => order.TotalAmount)
                })
                .OrderBy(item => item.Status)
                .ToListAsync();

            return Ok(new OrderSummaryReportDto
            {
                StartDate = start,
                EndDate = endInclusive,
                Items = items
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while generating order summary report.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }
}
