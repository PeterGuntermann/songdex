namespace Songdex.Backend.Application.Domain.Model;

public class Song
{
    public SongId Id { get; init; } = new();
    public string Title { get; init; } = string.Empty;
    public string Artist { get; init; } = string.Empty;
    public int? ReleaseYear { get; init; }
    public string? ReferenceLink { get; init; }
    public string? Notes { get; init; }
    public string? Genre { get; init; }
    public string? Language { get; init; }
    public string? Album { get; init; }
    public IReadOnlyList<Tag> Tags { get; init; } = [];

    /// <summary>
    /// A copy of this song that carries <paramref name="tags"/> instead of its own.
    /// </summary>
    public Song WithTags(IReadOnlyList<Tag> tags)
        => new()
        {
            Id = Id,
            Title = Title,
            Artist = Artist,
            ReleaseYear = ReleaseYear,
            ReferenceLink = ReferenceLink,
            Notes = Notes,
            Genre = Genre,
            Language = Language,
            Album = Album,
            Tags = tags,
        };
}
