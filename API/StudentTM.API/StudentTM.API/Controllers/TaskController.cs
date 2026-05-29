using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentTM.API.Enums;
using StudentTM.API.Models.Domain;
using StudentTM.API.Models.DTOs;
using StudentTM.API.Repositories.Interface;
using System.Security.Claims;

namespace StudentTM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ITaskRepository taskRepository;

        public TaskController(ITaskRepository taskRepository)
        {
            this.taskRepository = taskRepository;
        }

        // CREATE TASK
        [HttpPost]
        public async Task<IActionResult> CreateTask(
            CreateTaskRequestDto request)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            // Get Logged-in User Id from JWT
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                DueDate = request.DueDate,
                Priority = request.Priority,
                Status = request.Status,
                Category = request.Category,
                CreatedAt = DateTime.UtcNow,
                UserId = Guid.Parse(userId)
            };

            var isCreated =
                await taskRepository.CreateTaskAsync(task);

            if (!isCreated)
            {
                return BadRequest(new ApiResponseDto
                {
                    Success = false,
                    Message = "Failed to create task."
                });
            }

            return Ok(new ApiResponseDto
            {
                Success = true,
                Message = "Task created successfully."
            });

        }

        // GET USER TASKS
        [HttpGet]
        public async Task<IActionResult> GetTasks()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var tasks =
                await taskRepository.GetTasksByUserIdAsync(
                    Guid.Parse(userId));

            var response = tasks.Select(task => new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Priority = task.Priority,
                Status = task.Status,
                CreatedAt = task.CreatedAt
            });

            return Ok(new ApiResponseDto
            {
                Success = true,
                Message = "Tasks fetched successfully.",
                Data = response
            });
        }
        [HttpGet]
        [Route("{id:guid}")]
        public async Task<IActionResult> GetTaskById(
    Guid id)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var task =
                await taskRepository.GetTaskByIdAsync(
                    id,
                    Guid.Parse(userId));

            if (task == null)
            {
                return NotFound(new ApiResponseDto
                {
                    Success = false,
                    Message = "Task not found."
                });
            }

            return Ok(new ApiResponseDto
            {
                Success = true,
                Message = "Task fetched successfully.",
                Data = task
            });
        }
        // UPDATE TASK
        [HttpPut]
        [Route("{id:guid}")]
        public async Task<IActionResult> UpdateTask(
            Guid id,
            UpdateTaskRequestDto request)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }



            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var task = new TaskItem
            {
                Id = id,
                Title = request.Title,
                Description = request.Description,
                DueDate = request.DueDate,
                Priority = request.Priority,
                Status = request.Status,
                Category = request.Category,
                UpdatedAt = DateTime.UtcNow,
                UserId = Guid.Parse(userId)
            };

            var isUpdated =
                await taskRepository.UpdateTaskAsync(task);

            if (!isUpdated)
            {
                return NotFound(new ApiResponseDto
                {
                    Success = false,
                    Message = "Task not found."
                });
            }

            return Ok(new ApiResponseDto
            {
                Success = true,
                Message = "Task updated successfully."
            });
        }

        // DELETE TASK
        [HttpDelete]
        [Route("{id:guid}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var isDeleted =
                await taskRepository.DeleteTaskAsync(id);

            if (!isDeleted)
            {
                return NotFound(new ApiResponseDto
                {
                    Success = false,
                    Message = "Task not found."
                });
            }

            return Ok(new ApiResponseDto
            {
                Success = true,
                Message = "Task deleted successfully."
            });
        }

        [HttpGet]
        [Route("pending")]
        public async Task<IActionResult> GetPendingTasks()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var tasks = await taskRepository
                .GetTasksByStatusAsync(
                    Guid.Parse(userId),
                    TaskItemStatus.Pending);

            return Ok(new ApiResponseDto
            {
                Success = true,
                Message = "Pending tasks fetched successfully.",
                Data = tasks
            });
        }


        [HttpGet]
        [Route("inprogress")]
        public async Task<IActionResult> GetInProgressTasks()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var tasks = await taskRepository
                .GetTasksByStatusAsync(
                    Guid.Parse(userId),
                    TaskItemStatus.InProgress);

            return Ok(new ApiResponseDto
            {
                Success = true,
                Message = "Tasks that are in progress fetched successfully.",
                Data = tasks
            });
        }

        [HttpGet]
        [Route("completed")]
        public async Task<IActionResult> GetCompletedTasks()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var tasks = await taskRepository
                .GetTasksByStatusAsync(
                    Guid.Parse(userId),
                    TaskItemStatus.Completed);

            return Ok(new ApiResponseDto
            {
                Success = true,
                Message = "Completed tasks fetched successfully.",
                Data = tasks
            });
        }


        [HttpGet]
        [Route("sorted-by-priority")]
        public async Task<IActionResult>GetTasksSortedByPriority()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var tasks = await taskRepository
                .GetTasksSortedByPriorityAsync(
                    Guid.Parse(userId));

            return Ok(new ApiResponseDto
            {
                Success = true,
                Message = "Tasks are sorted by priority(desc) fetched successfully.",
                Data = tasks
            });
        }
    }
}