using StudentTM.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace StudentTM.API.Models.DTOs
{
    public class UpdateTaskRequestDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public string? DueDate { get; set; }

        public string? DueTime { get; set; }

        [Required]
        public Priority Priority { get; set; }

        public TaskItemStatus Status { get; set; }
        public string? Category { get; set; }
    }
}