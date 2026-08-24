using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.Models.DTOs;

namespace SupermarketAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        ApplicationDbContext dbContext,
        IConfiguration configuration,
        ILogger<AdminController> logger)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet("users/staff")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(IEnumerable<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetStaffUsers([FromQuery] string? search = null)
    {
        try
        {
            var query = _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Role != UserRole.Customer);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLowerInvariant();
                query = query.Where(u =>
                    u.Name.ToLower().Contains(term) ||
                    u.Email.ToLower().Contains(term) ||
                    u.Role.ToString().ToLower().Contains(term));
            }

            var users = await query
                .OrderBy(u => u.Name)
                .Select(u => ToUserResponse(u))
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching staff users.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpGet("users/{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserResponseDto>> GetStaffUserById(int id)
    {
        try
        {
            var user = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id && u.Role != UserRole.Customer);

            if (user is null)
            {
                return NotFound(new { message = "Staff user not found." });
            }

            return Ok(ToUserResponse(user));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching staff user {UserId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpPost("users")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserResponseDto>> CreateStaffUser([FromBody] CreateStaffUserDto dto)
    {
        try
        {
            var supervisorEmail = _configuration["Supervisor:Email"]?.Trim();
            if (string.IsNullOrWhiteSpace(supervisorEmail))
            {
                _logger.LogWarning("Supervisor:Email is not configured. Blocking staff user creation.");
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Supervisor access is not configured." });
            }

            var callerEmail = GetCurrentUserEmail();
            if (string.IsNullOrWhiteSpace(callerEmail) ||
                !string.Equals(callerEmail.Trim(), supervisorEmail, StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only the configured supervisor can create staff users." });
            }

            if (!Enum.IsDefined(typeof(UserRole), dto.Role))
            {
                return BadRequest(new { message = "Invalid role value." });
            }

            if (dto.Role == UserRole.Customer)
            {
                return BadRequest(new { message = "Customer role is not allowed for this endpoint." });
            }

            if (dto.Role is not UserRole.Admin and not UserRole.InventoryManager and not UserRole.Cashier)
            {
                return BadRequest(new { message = "Only Admin, InventoryManager, or Cashier roles are allowed." });
            }

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            var existingUser = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (existingUser is not null)
            {
                return Conflict(new { message = "Email already exists." });
            }

            var user = new User
            {
                Name = dto.Name.Trim(),
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address.Trim(),
                Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            user.Id = await MongoIdGenerator.NextAsync(_dbContext.Users, u => u.Id);

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var response = ToUserResponse(user);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error occurred while creating staff user {Email}.", dto.Email);
            return Conflict(new { message = "Unable to create staff user. Email may already exist." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while creating staff user {Email}.", dto.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    private string? GetCurrentUserEmail()
    {
        return User.FindFirstValue(JwtRegisteredClaimNames.Email)
            ?? User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email");
    }

    private static UserResponseDto ToUserResponse(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Address = user.Address,
            Phone = user.Phone,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            IsActive = user.IsActive
        };
    }
}
