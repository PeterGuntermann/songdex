using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Application.Abstractions;
using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Infrastructure.Database;

public class SongRepository(SongdexDbContext dbContext): ISongRepository
{
    public async Task<IEnumerable<Song>> GetAll()
    {
        return await dbContext.Songs.ToListAsync();
    }
}