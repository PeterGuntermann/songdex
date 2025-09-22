using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Songdex.Backend.Application.Abstractions;
using Songdex.Backend.Infrastructure.Database;

namespace Songdex.Backend.Infrastructure;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<SongdexDbContext>(options =>
            options.UseSqlite($"Data Source=songdex.db"));

        services.AddScoped<ISongRepository, SongRepository>();
        return services;
    }
}