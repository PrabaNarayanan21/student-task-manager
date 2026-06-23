using Microsoft.AspNetCore.Mvc;
using StudentTM.API.Models.Domain;
using StudentTM.API.Models.DTOs;
using StudentTM.API.Repositories.Interface;
using BCrypt.Net;


namespace StudentTM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository authRepository;
        private readonly ITokenRepository tokenRepository;
        private readonly ILogger<AuthController> logger;

        public AuthController(
            IAuthRepository authRepository,
            ITokenRepository tokenRepository, ILogger<AuthController> logger)
        {
            this.authRepository = authRepository;
            this.tokenRepository = tokenRepository;
            this.logger = logger;
        } 

        // REGISTER
        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            // Check existing user
            var existingUser =
                await authRepository.GetUserByEmailAsync(request.Email);

            if (existingUser != null)
            {
                return BadRequest("Email already exists.");
            }

            // Create User
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            // Register user
            var isRegistered =
                await authRepository.RegisterAsync(user);

            if (!isRegistered)
            {
                return BadRequest("Something went wrong.");
            }

            logger.LogInformation("New user registered: {Email}",request.Email);

            return Ok(new { message = "User registered successfully." });

        }

        // LOGIN
        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
            // Find user
            var user =
                await authRepository.GetUserByEmailAsync(request.Email);

            if (user == null)
            {
                logger.LogInformation("Invalid email or password.");
                return BadRequest("Invalid email or password.");

            }

            // Verify password
            var isPasswordValid = 
                BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    user.PasswordHash);

            if (!isPasswordValid)
            {
                return BadRequest("Invalid email or password.");
            }

            // Generate JWT
            var jwtToken =
                tokenRepository.CreateJWTToken(user);

            var response = new LoginResponseDto
            {
                JwtToken = jwtToken
            };

            logger.LogInformation("User {Email} logged in successfully", request.Email);

            return Ok(response);
        }
    }
}