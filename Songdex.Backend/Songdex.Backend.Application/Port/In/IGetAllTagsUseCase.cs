using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Lists every tag with its song count, sorted by name — unused tags included.
/// </summary>
public interface IGetAllTagsUseCase
{
    Task<IEnumerable<TagUsage>> GetAllTags();
}
