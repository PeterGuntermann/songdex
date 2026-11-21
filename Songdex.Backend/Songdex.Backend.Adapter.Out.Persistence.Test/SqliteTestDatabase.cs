using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Songdex.Backend.Adapter.Out.Persistence.Test;

/// <summary>
/// A migrated SQLite database that lives in memory for as long as the instance is alive. The
/// connection stays open because an in-memory database disappears with its last connection.
/// Hand out a fresh context per step, so nothing is served from a change tracker by accident.
/// </summary>
public sealed class SqliteTestDatabase : IAsyncDisposable
{
    private readonly SqliteConnection connection = new("DataSource=:memory:");

    private SqliteTestDatabase()
    {
    }

    /// <summary>Opens the database and applies every migration, which tests them along the way.</summary>
    public static async Task<SqliteTestDatabase> Create()
    {
        var database = new SqliteTestDatabase();
        await database.connection.OpenAsync();
        await using var context = database.NewContext();
        await context.Database.MigrateAsync();
        return database;
    }

    public SongdexDbContext NewContext()
        => new(new DbContextOptionsBuilder<SongdexDbContext>().UseSqlite(connection).Options);

    public ValueTask DisposeAsync() => connection.DisposeAsync();
}
