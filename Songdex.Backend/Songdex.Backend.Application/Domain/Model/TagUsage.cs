namespace Songdex.Backend.Application.Domain.Model;

/// <summary>
/// A tag together with the number of songs that carry it. A count of zero marks an unused tag.
/// </summary>
public record TagUsage(Tag Tag, int SongCount);
