using StudentTM.API.Models.Domain;

namespace StudentTM.API.Repositories.Interface
{
    public interface IAuthRepository
    {
        Task<bool> RegisterAsync(User user);

        Task<User?> GetUserByEmailAsync(string email);
    }
}