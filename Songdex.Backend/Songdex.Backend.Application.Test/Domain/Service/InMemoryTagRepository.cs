using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Application.Test.Domain.Service;

/// <summary>
/// Stand-in for the tag port. Name lookups ignore case, as the real adapter's do.
/// </summary>
public class InMemoryTagRepository : ITagRepository
{
    private readonly List<Tag> tags = [];

    public InMemoryTagRepository(params Tag[] initialTags)
    {
        tags.AddRange(initialTags);
    }

    public IReadOnlyList<Tag> Stored => tags;

    public Task<IEnumerable<Tag>> GetAll() => Task.FromResult<IEnumerable<Tag>>([.. tags]);

    public Task<IReadOnlyList<Tag>> GetByNames(IEnumerable<string> names)
    {
        var normalized = names.Select(Tag.Normalize).ToHashSet();
        return Task.FromResult<IReadOnlyList<Tag>>(
            [.. tags.Where(tag => normalized.Contains(Tag.Normalize(tag.Name)))]);
    }

    public Task<Tag> Add(Tag tag)
    {
        tags.Add(tag);
        return Task.FromResult(tag);
    }
}
