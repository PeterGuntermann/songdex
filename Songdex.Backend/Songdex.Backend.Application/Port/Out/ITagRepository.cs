using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.Out;

/// <summary>
/// Outgoing port for the tag catalogue. Name lookups ignore case, see <see cref="Tag.Normalize"/>.
/// </summary>
public interface ITagRepository
{
    /// <returns>Every tag with the number of songs carrying it, unused ones included.</returns>
    Task<IEnumerable<TagUsage>> GetAllWithUsage();

    /// <returns>The tag with its song count, or <c>null</c> when no tag with that id is stored.</returns>
    Task<TagUsage?> GetById(TagId id);

    /// <returns>The stored tags whose names match any of <paramref name="names"/>, ignoring case.
    /// Names without a stored tag are simply absent from the result.</returns>
    Task<IReadOnlyList<Tag>> GetByNames(IEnumerable<string> names);

    Task<Tag> Add(Tag tag);

    /// <returns><c>false</c> when no tag with that id is stored.</returns>
    Task<bool> Rename(TagId id, string name);

    /// <summary>Removes the tag and its assignment to every song.</summary>
    /// <returns><c>false</c> when no tag with that id is stored.</returns>
    Task<bool> Delete(TagId id);

    /// <summary>
    /// Gives every song carrying <paramref name="source"/> the <paramref name="target"/> tag instead
    /// and removes <paramref name="source"/>, in one transaction.
    /// </summary>
    /// <returns><c>false</c> when either tag is not stored.</returns>
    Task<bool> Merge(TagId source, TagId target);
}
