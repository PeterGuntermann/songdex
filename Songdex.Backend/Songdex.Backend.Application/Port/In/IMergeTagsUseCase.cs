using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Folds <c>source</c> into <c>target</c>: every song tagged with the source is
/// tagged with the target instead, and the source tag is removed. Returns the target tag.
/// </summary>
public interface IMergeTagsUseCase
{
    Task<TagChangeResult> MergeTags(TagId source, TagId target);
}
