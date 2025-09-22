using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Songdex.Backend.WebApi;

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

    public static WebApplication UseWebApi(this WebApplication app)
    {
        
        if (!app.Environment.IsDevelopment())
        {
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.UseRouting();
        app.UseCors(WebApiConstants.AllowSpecificOrigins);

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller}/{action=Index}/{id?}");

        app.MapGet("/", () => "Hello World!");
        return app;
    }
}