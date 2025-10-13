namespace Songdex.Backend.Domain.Model;

public class Song
{
    public SongId Id { get; init; } = new();
    public string Title { get; set; } = string.Empty;
}