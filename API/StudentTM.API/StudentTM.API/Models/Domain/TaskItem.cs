using System.ComponentModel.DataAnnotations;
using StudentTM.API.Enums;

namespace StudentTM.API.Models.Domain
{
    public class TaskItem
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        [Required]
        public Priority Priority { get; set; }

        public TaskItemStatus Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public string? Category { get; set; }

        // Foreign Key
        public Guid UserId { get; set; }

        // Navigation Property
        public User User { get; set; }
    }
}

