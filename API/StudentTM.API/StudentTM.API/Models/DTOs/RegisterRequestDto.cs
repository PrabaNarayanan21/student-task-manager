using System.ComponentModel.DataAnnotations;

namespace StudentTM.API.Models.DTOs
{
    public class RegisterRequestDto
    {
        [Required]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}