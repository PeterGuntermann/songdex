using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Infrastructure.Database;

public class SongdexDbContext : DbContext
{
    public DbSet<Song> Songs { get; set; }

    public string DbPath => "songdex.db";
    
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source={DbPath}");
}