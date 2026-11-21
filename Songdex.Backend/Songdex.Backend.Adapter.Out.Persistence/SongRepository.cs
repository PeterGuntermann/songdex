using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Adapter.Out.Persistence.Entities;
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
            .Include(song => song.Tags)
            .ToListAsync();
        return entities.Select(SongMappings.ToDomainObject);
    }

    public async Task<Song?> GetById(SongId id)
    {
        var entity = await dbContext.Songs
            .AsNoTracking()
            .Include(song => song.Tags)
            .SingleOrDefaultAsync(song => song.Id == id.Value);
        return entity is null ? null : SongMappings.ToDomainObject(entity);
    }

    public async Task<Song> Add(Song song)
    {
        var entity = SongMappings.ToDatabaseEntity(song);
        entity.Tags.AddRange(await StoredTags(song));
        dbContext.Songs.Add(entity);
        await dbContext.SaveChangesAsync();
        return SongMappings.ToDomainObject(entity);
    }

    public async Task<bool> Update(Song song)
    {
        var entity = await dbContext.Songs
            .Include(stored => stored.Tags)
            .SingleOrDefaultAsync(stored => stored.Id == song.Id.Value);
        if (entity is null)
        {
            return false;
        }

        SongMappings.CopyInto(song, entity);
        var tags = await StoredTags(song);
        entity.Tags.Clear();
        entity.Tags.AddRange(tags);
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

    /// <summary>
    /// The tracked entities of the song's tags. The application has stored every tag before it
    /// hands the song over, so an id without a row is a programming error and is skipped.
    /// </summary>
    private async Task<List<TagEntity>> StoredTags(Song song)
    {
        var ids = song.Tags.Select(tag => tag.Id.Value).ToList();
        if (ids.Count == 0)
        {
            return [];
        }

        return await dbContext.Tags
            .Where(tag => ids.Contains(tag.Id))
            .ToListAsync();
    }
}
