using Microsoft.Extensions.DependencyInjection;
using Songdex.Backend.Application.Coversongs;
using Songdex.Backend.Domain.Services;

namespace Songdex.Backend.Application;

public static class ApplicationExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddTransient<ICoversongsService, CoversongsService>();
        return services;
    }
}