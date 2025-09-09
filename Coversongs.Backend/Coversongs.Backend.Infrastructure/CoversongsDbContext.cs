using Coversongs.Backend.Domain.Model;
using Microsoft.EntityFrameworkCore;

namespace Coversongs.Backend.Infrastructure;

public class CoversongsDbContext : DbContext
{
    public DbSet<Coversong> Coversongs { get; set; }

    public string DbPath => "coversongs.db";
    
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source={DbPath}");
}