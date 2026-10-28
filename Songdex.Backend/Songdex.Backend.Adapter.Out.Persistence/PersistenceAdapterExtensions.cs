using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Songdex.Backend.Adapter.Out.Persistence.Seeding;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Adapter.Out.Persistence;

public static class PersistenceAdapterExtensions
{
    public static IServiceCollection AddPersistenceAdapter(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Songdex")
                               ?? throw new InvalidOperationException("Connection string 'Songdex' is missing.");

        services.AddDbContext<SongdexDbContext>(options => options.UseSqlite(connectionString));

        services.AddScoped<ISongRepository, SongRepository>();
        return services;
    }

    /// <summary>
    /// Migrates and seeds the local database on startup. Intended for development only.
    /// </summary>
    public static IServiceCollection AddLocalDatabaseInitializer(this IServiceCollection services)
    {
        services.AddHostedService<LocalDatabaseInitializer>();
        return services;
    }
}
