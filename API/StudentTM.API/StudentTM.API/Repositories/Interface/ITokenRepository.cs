using StudentTM.API.Models.Domain;

namespace StudentTM.API.Repositories.Interface
{
    public interface ITokenRepository
    {
        string CreateJWTToken(User user);
    }
}