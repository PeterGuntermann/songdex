using Songdex.Backend.Adapter.Out.Persistence.Mappings;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Adapter.Out.Persistence;

public class SongRepository(SongdexDbContext dbContext) : ISongRepository
{
    public async Task<IEnumerable<Song>> GetAll()
    {
        var songs = dbContext.Songs
            .Select(SongMappings.ToDomainObject);
        return songs;
    }
}
