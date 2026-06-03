using Microsoft.Data.SqlClient;
using StudentTM.API.Enums;
using StudentTM.API.Models.Domain;
using StudentTM.API.Repositories.Interface;
using System.Data;

namespace StudentTM.API.Repositories.Implementation
{
    public class TaskRepository : ITaskRepository
    {
        private readonly IConfiguration configuration;

        public TaskRepository(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public async Task<bool> CreateTaskAsync(TaskItem task)
        {
            var connectionString =
                configuration.GetConnectionString("DefaultConnection");

            using SqlConnection connection =
                new SqlConnection(connectionString);

            using SqlCommand command =
                new SqlCommand("sp_CreateTask", connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@Id", task.Id);
            command.Parameters.AddWithValue("@Title", task.Title);
            command.Parameters.AddWithValue("@Description",
                (object?)task.Description ?? DBNull.Value);

            command.Parameters.AddWithValue("@DueDate", task.DueDate);


            command.Parameters.AddWithValue("@Priority",
                (int)task.Priority);

            command.Parameters.AddWithValue("@Status",
                (int)task.Status);

            command.Parameters.AddWithValue("@CreatedAt",
                task.CreatedAt);

            command.Parameters.AddWithValue("@UserId",
                task.UserId);
            command.Parameters.AddWithValue("@Category",
    (object?)task.Category ?? DBNull.Value);

            await connection.OpenAsync();

            var rowsAffected =
                await command.ExecuteNonQueryAsync();

            return rowsAffected > 0;
        }

        public async Task<List<TaskItem>> GetTasksByUserIdAsync(Guid userId)
        {
            var tasks = new List<TaskItem>();

            var connectionString =
                configuration.GetConnectionString("DefaultConnection");

            using SqlConnection connection =
                new SqlConnection(connectionString);

            using SqlCommand command =
                new SqlCommand("sp_GetTasksByUserId", connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@UserId", userId);

            await connection.OpenAsync();

            using SqlDataReader reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                tasks.Add(new TaskItem
                {
                    Id = reader.GetGuid(reader.GetOrdinal("Id")),
                    Title = reader["Title"].ToString(),
                    Description = reader["Description"]?.ToString(),
                    DueDate = reader["DueDate"] == DBNull.Value
                        ? null
                        : Convert.ToDateTime(reader["DueDate"]),
                    Priority = (Enums.Priority)
                        Convert.ToInt32(reader["Priority"]),
                    Status = (Enums.TaskItemStatus)
                        Convert.ToInt32(reader["Status"]),
                    CreatedAt =
                        Convert.ToDateTime(reader["CreatedAt"]),
                    UpdatedAt = reader["UpdatedAt"] == DBNull.Value
                        ? null
                        : Convert.ToDateTime(reader["UpdatedAt"]),
                    UserId =
                        reader.GetGuid(reader.GetOrdinal("UserId")),
                    Category = reader["Category"] == DBNull.Value
        ? null
        : reader["Category"].ToString()
                });
            }

            return tasks;
        }
        public async Task<TaskItem?> GetTaskByIdAsync(
    Guid id,
    Guid userId)
        {
            TaskItem? task = null;

            using var connection =
                new SqlConnection(
                    configuration.GetConnectionString("DefaultConnection"));

            using var command =
                new SqlCommand(
                    "sp_GetTaskById",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@Id", id);

            command.Parameters.AddWithValue("@UserId", userId);

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                task = new TaskItem
                {
                    Id = Guid.Parse(reader["Id"].ToString()),

                    Title = reader["Title"].ToString(),

                    Description =
                        reader["Description"]?.ToString(),

                    DueDate =
                        reader["DueDate"] == DBNull.Value
                        ? null
                        : Convert.ToDateTime(reader["DueDate"]),

                    Priority =
                        (Priority)Convert.ToInt32(
                            reader["Priority"]),

                    Status =
                        (TaskItemStatus)Convert.ToInt32(
                            reader["Status"]),

                    CreatedAt =
                        Convert.ToDateTime(
                            reader["CreatedAt"]),

                    UpdatedAt =
                        reader["UpdatedAt"] == DBNull.Value
                        ? null
                        : Convert.ToDateTime(
                            reader["UpdatedAt"]),

                    UserId =
                        Guid.Parse(
                            reader["UserId"].ToString()),
                    Category = reader["Category"] == DBNull.Value
        ? null
        : reader["Category"].ToString()
                };
            }

            return task;
        }
        public async Task<bool> UpdateTaskAsync(TaskItem task)
        {
            using var connection =
                new SqlConnection(configuration.GetConnectionString("DefaultConnection"));

            using var command = new SqlCommand(
                "sp_UpdateTask",
                connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@Id", task.Id);
            command.Parameters.AddWithValue("@Title", task.Title);
            command.Parameters.AddWithValue("@Description",
                (object?)task.Description ?? DBNull.Value);

            command.Parameters.AddWithValue("@DueDate",
                (object?)task.DueDate ?? DBNull.Value);

            command.Parameters.AddWithValue("@Priority",
                (int)task.Priority);

            command.Parameters.AddWithValue("@Status",
                (int)task.Status);

            command.Parameters.AddWithValue("@UpdatedAt",
                (object?)task.UpdatedAt ?? DBNull.Value);

            
            command.Parameters.AddWithValue("@UserId",
                task.UserId);
            command.Parameters.AddWithValue("@Category",
    (object?)task.Category ?? DBNull.Value);

            await connection.OpenAsync();

            var rowsAffected =
                await command.ExecuteNonQueryAsync();

            return rowsAffected > 0;
        }
        public async Task<bool> DeleteTaskAsync(Guid taskId, Guid userId)
        {
            var connectionString =
                configuration.GetConnectionString("DefaultConnection");

            using SqlConnection connection =
                new SqlConnection(connectionString);

            using SqlCommand command =
                new SqlCommand("sp_DeleteTask", connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@Id", taskId);
            command.Parameters.AddWithValue("@UserId", userId);

            await connection.OpenAsync();

            var rowsAffected =
                await command.ExecuteNonQueryAsync();

            return rowsAffected > 0;
        }

        public async Task<IEnumerable<TaskItem>>GetTasksByStatusAsync(Guid userId,TaskItemStatus status)
        {
            var tasks = new List<TaskItem>();

            using var connection =
                new SqlConnection(
                    configuration.GetConnectionString("DefaultConnection"));

            using var command = new SqlCommand(
                "sp_GetTasksByStatus",
                connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@UserId", userId);
            command.Parameters.AddWithValue("@Status", (int)status);

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                tasks.Add(new TaskItem
                {
                    Id = Guid.Parse(reader["Id"].ToString()),
                    Title = reader["Title"].ToString(),
                    Description = reader["Description"]?.ToString(),
                    DueDate = reader["DueDate"] as DateTime?,
                    Priority = (Priority)reader["Priority"],
                    Status = (TaskItemStatus)reader["Status"],
                    CreatedAt = (DateTime)reader["CreatedAt"],
                    UpdatedAt = reader["UpdatedAt"] as DateTime?,
                    UserId = Guid.Parse(reader["UserId"].ToString()),
                    Category = reader["Category"] == DBNull.Value ? null: reader["Category"].ToString()
                });
            }

            return tasks;
        }


        public async Task<IEnumerable<TaskItem>>GetTasksSortedByPriorityAsync(Guid userId)
        {
            var tasks = new List<TaskItem>();

            using var connection =
                new SqlConnection(
                    configuration.GetConnectionString("DefaultConnection"));

            using var command = new SqlCommand(
                "sp_GetTasksSortedByPriority",
                connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@UserId", userId);

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                tasks.Add(new TaskItem
                {
                    Id = Guid.Parse(reader["Id"].ToString()),
                    Title = reader["Title"].ToString(),
                    Description = reader["Description"]?.ToString(),
                    DueDate = reader["DueDate"] as DateTime?,
                    Priority = (Priority)reader["Priority"],
                    Status = (TaskItemStatus)reader["Status"],
                    CreatedAt = (DateTime)reader["CreatedAt"],
                    UpdatedAt = reader["UpdatedAt"] as DateTime?,
                    UserId = Guid.Parse(reader["UserId"].ToString()),
                    Category = reader["Category"] == DBNull.Value? null : reader["Category"].ToString()
                });
            }

            return tasks;
        }
    }
}