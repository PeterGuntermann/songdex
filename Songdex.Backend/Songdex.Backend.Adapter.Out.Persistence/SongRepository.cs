using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Adapter.Out.Persistence.Mappings;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Adapter.Out.Persistence;

public class SongRepository(SongdexDbContext dbContext) : ISongRepository
{
    public async Task<IEnumerable<Song>> GetAll()
    {
        var entities = await dbContext.Songs
            .AsNoTracking()
            .ToListAsync();
        return entities.Select(SongMappings.ToDomainObject);
    }

    public async Task<Song?> GetById(SongId id)
    {
        var entity = await dbContext.Songs
            .AsNoTracking()
            .SingleOrDefaultAsync(song => song.Id == id.Value);
        return entity is null ? null : SongMappings.ToDomainObject(entity);
    }

    public async Task<Song> Add(Song song)
    {
        var entity = SongMappings.ToDatabaseEntity(song);
        dbContext.Songs.Add(entity);
        await dbContext.SaveChangesAsync();
        return SongMappings.ToDomainObject(entity);
    }

    public async Task<bool> Update(Song song)
    {
        var entity = await dbContext.Songs
            .SingleOrDefaultAsync(stored => stored.Id == song.Id.Value);
        if (entity is null)
        {
            return false;
        }

        SongMappings.CopyInto(song, entity);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Delete(SongId id)
    {
        var entity = await dbContext.Songs
            .SingleOrDefaultAsync(song => song.Id == id.Value);
        if (entity is null)
        {
            return false;
        }

        dbContext.Songs.Remove(entity);
        await dbContext.SaveChangesAsync();
        return true;
    }
}
