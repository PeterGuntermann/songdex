using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Removes a tag from every song and from the catalogue; returns <c>false</c> when
/// the id is unknown.
/// </summary>
public interface IDeleteTagUseCase
{
    Task<bool> DeleteTag(TagId id);
}
