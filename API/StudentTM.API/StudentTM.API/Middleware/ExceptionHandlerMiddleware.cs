using System.Net;
using System.Text.Json;

namespace StudentTM.API.Middleware
{
    public class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate next;
        private readonly ILogger<ExceptionHandlerMiddleware> logger;

        public ExceptionHandlerMiddleware(RequestDelegate next,ILogger<ExceptionHandlerMiddleware> logger)
        { 
            this.next = next;
            this.logger = logger;
        } 

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);

                context.Response.StatusCode =(int)HttpStatusCode.InternalServerError;

                context.Response.ContentType ="application/json";

                var response = new
                {
                    Message =
                    "Something went wrong. Please try again later."
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        }
    }
}