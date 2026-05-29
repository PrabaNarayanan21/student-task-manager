using StudentTM.API.Enums;

namespace StudentTM.API.Models.DTOs
{
    public class TaskDto
    {
        public Guid Id { get; set; }

        public string Title { get; set; }

        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        public Priority Priority { get; set; }

        public TaskItemStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public string? Category { get; set; }
    }
}