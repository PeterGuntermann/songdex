using Songdex.Backend.Domain.Model;
using Songdex.Backend.Infrastructure.Database;

namespace Songdex.Backend.Service.Seeding;

public class LocalDatabaseInitializer(
    IServiceScopeFactory serviceScopeFactory,
    ILogger<LocalDatabaseInitializer> logger)
    : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await using var scope = serviceScopeFactory.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<SongdexDbContext>();

        var numberOfSongs = context.Songs.Count();
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