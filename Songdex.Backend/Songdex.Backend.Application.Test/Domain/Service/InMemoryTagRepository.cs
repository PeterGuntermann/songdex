using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Application.Test.Domain.Service;

/// <summary>
/// Stand-in for the tag port. Name lookups ignore case, as the real adapter's do. It knows no
/// songs: counts come from <see cref="SongCounts"/>, and merging only removes the source. What the
/// real adapter does to the songs is covered by <c>TagRepositoryTest</c> against SQLite.
/// </summary>
public class InMemoryTagRepository : ITagRepository
{
    private readonly List<Tag> tags = [];

    public InMemoryTagRepository(params Tag[] initialTags)
    {
        tags.AddRange(initialTags);
    }

    public IReadOnlyList<Tag> Stored => tags;

    /// <summary>Song counts by tag id; tags without an entry count as unused.</summary>
    public Dictionary<string, int> SongCounts { get; } = [];

    public List<(TagId Source, TagId Target)> Merges { get; } = [];

    public Task<IEnumerable<TagUsage>> GetAllWithUsage()
        => Task.FromResult<IEnumerable<TagUsage>>([.. tags.Select(Usage)]);

    public Task<TagUsage?> GetById(TagId id)
    {
        var tag = tags.SingleOrDefault(stored => stored.Id == id);
        return Task.FromResult(tag is null ? null : Usage(tag));
    }

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

    public Task<bool> Rename(TagId id, string name)
    {
        var index = tags.FindIndex(tag => tag.Id == id);
        if (index < 0)
        {
            return Task.FromResult(false);
        }

        tags[index] = new Tag { Id = id, Name = name };
        return Task.FromResult(true);
    }

    public Task<bool> Delete(TagId id) => Task.FromResult(tags.RemoveAll(tag => tag.Id == id) > 0);

    public Task<bool> Merge(TagId source, TagId target)
    {
        if (!tags.Any(tag => tag.Id == source) || !tags.Any(tag => tag.Id == target))
        {
            return Task.FromResult(false);
        }

        Merges.Add((source, target));
        tags.RemoveAll(tag => tag.Id == source);
        return Task.FromResult(true);
    }

    private TagUsage Usage(Tag tag) => new(tag, SongCounts.GetValueOrDefault(tag.Id.Value));
}
