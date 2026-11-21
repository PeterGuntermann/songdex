using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Adapter.Out.Persistence.Entities;

namespace Songdex.Backend.Adapter.Out.Persistence;

public class SongdexDbContext(DbContextOptions<SongdexDbContext> options) : DbContext(options)
{
    public DbSet<SongEntity> Songs { get; set; }

    public DbSet<TagEntity> Tags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TagEntity>()
            .HasIndex(tag => tag.NormalizedName)
            .IsUnique();

        // Deleting a song or a tag removes its join rows; the other side stays.
        modelBuilder.Entity<SongEntity>()
            .HasMany(song => song.Tags)
            .WithMany(tag => tag.Songs)
            .UsingEntity(join => join.ToTable("SongTags"));
    }
}
