using Microsoft.Data.SqlClient;
using StudentTM.API.Models.Domain;
using StudentTM.API.Repositories.Interface;
using System.Data;

namespace StudentTM.API.Repositories.Implementation
{
    public class AuthRepository : IAuthRepository
    {
        private readonly IConfiguration configuration;

        public AuthRepository(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public async Task<bool> RegisterAsync(User user)
        {
            var connectionString =
                configuration.GetConnectionString("DefaultConnection");

            using SqlConnection connection =
                new SqlConnection(connectionString);

            using SqlCommand command =
                new SqlCommand("sp_RegisterUser", connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@Id", user.Id);
            command.Parameters.AddWithValue("@Username", user.Username);
            command.Parameters.AddWithValue("@Email", user.Email);
            command.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
            command.Parameters.AddWithValue("@CreatedAt", user.CreatedAt);

            await connection.OpenAsync();

            var rowsAffected = await command.ExecuteNonQueryAsync();

            return rowsAffected > 0;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            var connectionString =
                configuration.GetConnectionString("DefaultConnection");

            using SqlConnection connection =
                new SqlConnection(connectionString);

            using SqlCommand command =
                new SqlCommand("sp_GetUserByEmail", connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@Email", email);

            await connection.OpenAsync();

            using SqlDataReader reader =
                await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new User
                {
                    Id = reader.GetGuid(reader.GetOrdinal("Id")),
                    Username = reader["Username"].ToString(),
                    Email = reader["Email"].ToString(),
                    PasswordHash = reader["PasswordHash"].ToString(),
                    CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
                };
            }

            return null;
        }
    }
}