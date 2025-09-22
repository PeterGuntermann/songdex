using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Infrastructure.Database;

public class SongdexDbContext : DbContext
{
    public DbSet<Song> Songs { get; set; }

    public string DbPath { get; }

    public SongdexDbContext()
    {
        var folder = Environment.SpecialFolder.LocalApplicationData;
        var path = Environment.GetFolderPath(folder);
        DbPath = Path.Join(path, "songdex.db");
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source={DbPath}");
}