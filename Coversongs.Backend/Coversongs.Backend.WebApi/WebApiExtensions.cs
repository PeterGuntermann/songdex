using Microsoft.Extensions.DependencyInjection;

namespace Coversongs.Backend.WebApi;

public static class WebApiConstants
{
    public const string AllowSpecificOrigins = "AllowSpecificOrigins";
}

public static class WebApiExtensions
{
    public static IServiceCollection AddWebApi(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(name: WebApiConstants.AllowSpecificOrigins,
                policy => { policy.WithOrigins("http://localhost:4200", "http://localhost:8080"); });
        });
        services.AddControllers();
        return services;
    }
}