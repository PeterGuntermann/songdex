using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Lists every tag, sorted by name — including those no song carries.
/// </summary>
public interface IGetAllTagsUseCase
{
    Task<IEnumerable<Tag>> GetAllTags();
}
