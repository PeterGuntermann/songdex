using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.Out;

/// <summary>
/// Outgoing port for the tag catalogue. Name lookups ignore case, see <see cref="Tag.Normalize"/>.
/// </summary>
public interface ITagRepository
{
    Task<IEnumerable<Tag>> GetAll();

    /// <returns>The stored tags whose names match any of <paramref name="names"/>, ignoring case.
    /// Names without a stored tag are simply absent from the result.</returns>
    Task<IReadOnlyList<Tag>> GetByNames(IEnumerable<string> names);

    Task<Tag> Add(Tag tag);
}
