using StudentTM.API.Models.Domain;
using StudentTM.API.Enums;
namespace StudentTM.API.Repositories.Interface
{
    public interface ITaskRepository
    {
        Task<bool> CreateTaskAsync(TaskItem task);

        Task<List<TaskItem>> GetTasksByUserIdAsync(Guid userId);

        Task<bool> UpdateTaskAsync(TaskItem task);

        Task<bool> DeleteTaskAsync(Guid taskId);
        Task<IEnumerable<TaskItem>> GetTasksByStatusAsync(Guid userId,TaskItemStatus status);

        Task<IEnumerable<TaskItem>> GetTasksSortedByPriorityAsync(Guid userId);
        Task<TaskItem?> GetTaskByIdAsync(Guid id,Guid userId);
    }
}