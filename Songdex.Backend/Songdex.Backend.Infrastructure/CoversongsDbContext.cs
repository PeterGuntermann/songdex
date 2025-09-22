using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Infrastructure;

public class CoversongsDbContext : DbContext
{
    public DbSet<Coversong> Coversongs { get; set; }

    public string DbPath => "coversongs.db";
    
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source={DbPath}");
}