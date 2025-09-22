using Microsoft.Extensions.DependencyInjection;
using Songdex.Backend.Application.Abstractions;
using Songdex.Backend.Infrastructure.Database;

namespace Songdex.Backend.Infrastructure;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<ISongRepository, SongRepository>();
        return services;
    }
}