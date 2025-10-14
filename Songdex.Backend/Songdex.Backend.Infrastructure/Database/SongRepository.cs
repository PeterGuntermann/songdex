using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Application.Abstractions;
using Songdex.Backend.Domain.Model;
using Songdex.Backend.Infrastructure.Database.Entities;
using Songdex.Backend.Infrastructure.Database.Mappings;

namespace Songdex.Backend.Infrastructure.Database;

public class SongRepository(SongdexDbContext dbContext) : ISongRepository
{
    public async Task<IEnumerable<Song>> GetAll()
    {
        var songs = dbContext.Songs
            .Select(SongMappings.ToDomainObject);
        return songs;
    }
}