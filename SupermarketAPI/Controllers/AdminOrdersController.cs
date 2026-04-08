using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.DTOs;
using SupermarketAPI.Models;

namespace SupermarketAPI.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin,InventoryManager")]
public class AdminOrdersController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<AdminOrdersController> _logger;

    public AdminOrdersController(ApplicationDbContext dbContext, ILogger<AdminOrdersController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpGet("pending-payment")]
    [ProducesResponseType(typeof(IEnumerable<AdminOrderPaymentItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<AdminOrderPaymentItemDto>>> GetPendingPaymentOrders()
    {
        try
        {
            var orders = await (
                from order in _dbContext.Orders.AsNoTracking()
                join user in _dbContext.Users.AsNoTracking() on order.UserId equals user.Id
                where order.PaymentStatus == PaymentStatus.Pending && order.Status != OrderStatus.Cancelled
                orderby order.OrderDate descending
                select new AdminOrderPaymentItemDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    CustomerName = user.Name,
                    CustomerEmail = user.Email,
                    OrderDate = order.OrderDate,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status.ToString(),
                    PaymentStatus = order.PaymentStatus.ToString(),
                    PaymentMethod = order.PaymentMethod,
                    TotalItems = order.Items.Sum(i => i.Quantity)
                }
            ).ToListAsync();

            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching pending payment orders.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpPatch("{id:int}/mark-paid")]
    [ProducesResponseType(typeof(AdminMarkOrderPaidResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AdminMarkOrderPaidResponseDto>> MarkOrderAsPaid(int id)
    {
        try
        {
            var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == id);
            if (order is null)
            {
                return NotFound(new { message = "Order not found." });
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                return Conflict(new { message = "Cancelled orders cannot be marked as paid." });
            }

            order.PaymentStatus = PaymentStatus.Paid;
            if (order.Status == OrderStatus.Pending)
            {
                order.Status = OrderStatus.Confirmed;
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new AdminMarkOrderPaidResponseDto
            {
                Id = order.Id,
                Status = order.Status.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                UpdatedAtUtc = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while marking order {OrderId} as paid.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }
}
