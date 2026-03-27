using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Songdex.Backend.Application.Abstractions;
using Songdex.Backend.Infrastructure.Database;

namespace Songdex.Backend.Infrastructure;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Songdex")
                               ?? throw new InvalidOperationException("Connection string 'Songdex' is missing.");

        services.AddDbContext<SongdexDbContext>(options => options.UseSqlite(connectionString));

        services.AddScoped<ISongRepository, SongRepository>();
        return services;
    }
}