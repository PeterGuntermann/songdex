using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Adapter.Out.Persistence.Entities;

namespace Songdex.Backend.Adapter.Out.Persistence;

public class SongdexDbContext(DbContextOptions<SongdexDbContext> options) : DbContext(options)
{
    public DbSet<SongEntity> Songs { get; set; }
}
