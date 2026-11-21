using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Adapter.Out.Persistence.Mappings;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Adapter.Out.Persistence;

public class TagRepository(SongdexDbContext dbContext) : ITagRepository
{
    public async Task<IEnumerable<Tag>> GetAll()
    {
        var entities = await dbContext.Tags
            .AsNoTracking()
            .ToListAsync();
        return entities.Select(TagMappings.ToDomainObject);
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
}
