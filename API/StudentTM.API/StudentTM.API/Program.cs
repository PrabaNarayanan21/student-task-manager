using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StudentTM.API.Middleware;
using StudentTM.API.Repositories.Implementation;
using StudentTM.API.Repositories.Interface;
using System.Security.Cryptography.Xml;
using System.Text;

var builder = WebApplication.CreateBuilder(args); //It creates a web application builder object,that lets us register services,dependencies,middleware before the app actually starts running

// Add services
builder.Services.AddControllers();  //It registers services needed for API Controllers

// Repositories                     
builder.Services.AddScoped<IAuthRepository, AuthRepository>(); //registers repo in di container
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITokenRepository, TokenRepository>();

// registers authentication services in ASP.NET //JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme) //tells the app to use jwt bearer token authentication
    .AddJwtBearer(options =>                                                //without this,[Authorize] keyword in controllers does nothing
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,   // check who created the token
            ValidateAudience = true, // check who the token is for
            ValidateLifetime = true, // check if token is expired
            ValidateIssuerSigningKey = true, // check the signature is valid
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();  
    }); 
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "StudentTM API",
        Version = "v1"
    });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Token"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Middleware pipeline (order matters)
app.UseCors("AllowAngular");                    // 1. CORS first — handles preflight OPTIONS

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();                           // 2. Swagger (dev only)
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlerMiddleware>(); // 3. Global exception handler
app.UseHttpsRedirection();                      // 4. HTTPS redirect
app.UseAuthentication();                        // 5. Who are you?
app.UseAuthorization();                         // 6. Are you allowed?
app.MapControllers();                           // 7. Route to controller

app.Run();