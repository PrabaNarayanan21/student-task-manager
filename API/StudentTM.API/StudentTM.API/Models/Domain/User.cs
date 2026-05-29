using System.ComponentModel.DataAnnotations;

namespace StudentTM.API.Models.Domain
{
    public class User
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; }

        [Required]
        [MaxLength(150)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}