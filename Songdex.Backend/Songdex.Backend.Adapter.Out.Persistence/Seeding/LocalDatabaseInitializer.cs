using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Songdex.Backend.Adapter.Out.Persistence.Seeding;

public class LocalDatabaseInitializer(
    IServiceScopeFactory serviceScopeFactory,
    ILogger<LocalDatabaseInitializer> logger)
    : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await using var scope = serviceScopeFactory.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<SongdexDbContext>();

        await context.Database.MigrateAsync(cancellationToken);
        var numberOfSongs = await context.Songs.CountAsync(cancellationToken);

        if (numberOfSongs == 0)
        {
            logger.LogInformation("Initializing empty local database...");

            context.Songs.AddRange(DataSeed.Songs);

            await context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            logger.LogInformation(
                "Found non-empty database with {Count} songs. Skip initializing...",
                numberOfSongs);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
