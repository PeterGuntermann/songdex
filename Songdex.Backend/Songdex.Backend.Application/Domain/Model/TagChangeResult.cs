namespace Songdex.Backend.Application.Domain.Model;

public enum TagChangeStatus
{
    Succeeded,

    /// <summary>A tag the change refers to does not exist.</summary>
    NotFound,

    /// <summary>Another tag carries the requested name already, regardless of case.</summary>
    NameTaken,

    /// <summary>A tag was asked to be merged into itself.</summary>
    SameTag,
}

/// <summary>
/// The outcome of renaming or merging tags. <see cref="Tag"/> is the resulting tag and is set only
/// when <see cref="Status"/> is <see cref="TagChangeStatus.Succeeded"/>. Deliberately specific to
/// tags; a general result type is T-7.
/// </summary>
public record TagChangeResult(TagChangeStatus Status, TagUsage? Tag = null);
