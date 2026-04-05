using System.ComponentModel.DataAnnotations;

namespace SupermarketAPI.Models.DTOs;

public class CreateStaffUserDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [StringLength(100)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare(nameof(Password))]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [RegularExpression(@"^[0-9+()\-\s]{7,20}$", ErrorMessage = "Phone number must be 7-20 characters and contain only digits, spaces, and + ( ) - symbols.")]
    [StringLength(20)]
    public string? Phone { get; set; }
}
