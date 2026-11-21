using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Adapter.Out.Persistence.Mappings;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Adapter.Out.Persistence;

public class TagRepository(SongdexDbContext dbContext) : ITagRepository
{
    public async Task<IEnumerable<TagUsage>> GetAllWithUsage()
    {
        var rows = await dbContext.Tags
            .AsNoTracking()
            .Select(tag => new { Tag = tag, SongCount = tag.Songs.Count })
            .ToListAsync();
        return rows.Select(row => new TagUsage(TagMappings.ToDomainObject(row.Tag), row.SongCount));
    }

    public async Task<TagUsage?> GetById(TagId id)
    {
        var row = await dbContext.Tags
            .AsNoTracking()
            .Where(tag => tag.Id == id.Value)
            .Select(tag => new { Tag = tag, SongCount = tag.Songs.Count })
            .SingleOrDefaultAsync();
        return row is null ? null : new TagUsage(TagMappings.ToDomainObject(row.Tag), row.SongCount);
    }

    public async Task<IReadOnlyList<Tag>> GetByNames(IEnumerable<string> names)
    {
        var normalized = names.Select(Tag.Normalize).Distinct().ToList();
        var entities = await dbContext.Tags
            .AsNoTracking()
            .Where(tag => normalized.Contains(tag.NormalizedName))
            .ToListAsync();
        return entities.Select(TagMappings.ToDomainObject).ToList();
    }

    public async Task<Tag> Add(Tag tag)
    {
        var entity = TagMappings.ToDatabaseEntity(tag);
        dbContext.Tags.Add(entity);
        await dbContext.SaveChangesAsync();
        return TagMappings.ToDomainObject(entity);
    }

    public async Task<bool> Rename(TagId id, string name)
    {
        var entity = await dbContext.Tags.SingleOrDefaultAsync(tag => tag.Id == id.Value);
        if (entity is null)
        {
            return false;
        }

        entity.Name = name;
        entity.NormalizedName = Tag.Normalize(name);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Delete(TagId id)
    {
        var entity = await dbContext.Tags.SingleOrDefaultAsync(tag => tag.Id == id.Value);
        if (entity is null)
        {
            return false;
        }

        // The SongTags rows go with it through the cascading foreign key.
        dbContext.Tags.Remove(entity);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Merge(TagId source, TagId target)
    {
        var sourceEntity = await dbContext.Tags
            .Include(tag => tag.Songs)
            .ThenInclude(song => song.Tags)
            .SingleOrDefaultAsync(tag => tag.Id == source.Value);
        var targetEntity = await dbContext.Tags.SingleOrDefaultAsync(tag => tag.Id == target.Value);
        if (sourceEntity is null || targetEntity is null)
        {
            return false;
        }

        foreach (var song in sourceEntity.Songs.Where(song => !song.Tags.Contains(targetEntity)))
        {
            song.Tags.Add(targetEntity);
        }

        dbContext.Tags.Remove(sourceEntity);
        // One SaveChanges, hence one transaction: either every song moves over or none does.
        await dbContext.SaveChangesAsync();
        return true;
    }
}
