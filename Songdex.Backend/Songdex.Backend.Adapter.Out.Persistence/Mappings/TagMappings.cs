using Songdex.Backend.Adapter.Out.Persistence.Entities;
using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.Out.Persistence.Mappings;

public static class TagMappings
{
    public static Tag ToDomainObject(TagEntity entity)
        => new() { Id = new TagId(entity.Id), Name = entity.Name };

    public static TagEntity ToDatabaseEntity(Tag tag)
        => new() { Id = tag.Id.Value, Name = tag.Name, NormalizedName = Tag.Normalize(tag.Name) };
}
