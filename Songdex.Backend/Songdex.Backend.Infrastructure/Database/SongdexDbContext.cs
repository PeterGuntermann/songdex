using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Infrastructure.Database;

public class SongdexDbContext(DbContextOptions<SongdexDbContext> options) : DbContext(options)
{
    public DbSet<Song> Songs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Song>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasConversion<string>(v => v.Value, v => new SongId(v));
            entity.Property(e => e.Title).HasMaxLength(200);
        });
    }
}