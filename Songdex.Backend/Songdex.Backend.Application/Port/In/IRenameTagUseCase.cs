using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Gives a tag a new name; fails with <see cref="TagChangeStatus.NameTaken"/> when
/// another tag carries that name already. Changing only the spelling of a tag's own name is fine.
/// </summary>
public interface IRenameTagUseCase
{
    Task<TagChangeResult> RenameTag(TagId id, string name);
}
