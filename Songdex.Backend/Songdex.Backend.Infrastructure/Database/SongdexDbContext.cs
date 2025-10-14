using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Domain.Model;
using Songdex.Backend.Infrastructure.Database.Entities;

namespace Songdex.Backend.Infrastructure.Database;

public class SongdexDbContext(DbContextOptions<SongdexDbContext> options) : DbContext(options)
{
    public DbSet<SongEntity> Songs { get; set; }
}