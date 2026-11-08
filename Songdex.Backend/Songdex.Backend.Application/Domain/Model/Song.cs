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
}
