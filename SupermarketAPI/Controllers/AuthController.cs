using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.Interfaces;
using SupermarketAPI.Models.DTOs;

namespace SupermarketAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext dbContext,
        IJwtTokenService jwtTokenService,
        ILogger<AuthController> logger)
    {
        _dbContext = dbContext;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserResponseDto>> Register([FromBody] RegisterDto dto)
    {
        try
        {
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

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var response = ToUserResponse(user);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error occurred while registering user {Email}.", dto.Email);
            return Conflict(new { message = "Unable to register user. Email may already exist." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred during registration for {Email}.", dto.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        try
        {
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail && u.IsActive);

            if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var authResponse = _jwtTokenService.GenerateToken(user);
            return Ok(authResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred during login for {Email}.", dto.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [Authorize]
    [HttpGet("profile")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserResponseDto>> GetProfile()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId.Value && u.IsActive);

            if (user is null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(ToUserResponse(user));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching profile.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [Authorize]
    [HttpPut("profile")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserResponseDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId.Value && u.IsActive);

            if (user is null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.Name = dto.Name.Trim();
            user.Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address.Trim();
            user.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(ToUserResponse(user));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while updating profile.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId.Value && u.IsActive);

            if (user is null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Current password is incorrect." });
            }

            if (dto.CurrentPassword == dto.NewPassword)
            {
                return BadRequest(new { message = "New password must be different from current password." });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while changing password.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    private int? GetCurrentUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(sub, out var userId) ? userId : null;
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
