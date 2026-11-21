using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Adds a tag; returns <c>null</c> when a tag of that name exists already,
/// regardless of case.
/// </summary>
public interface ICreateTagUseCase
{
    Task<Tag?> CreateTag(Tag tag);
}
