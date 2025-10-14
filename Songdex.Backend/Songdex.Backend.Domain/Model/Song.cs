namespace Songdex.Backend.Domain.Model;

public class Song
{
    public SongId Id { get; init; } = new();
    public string Title { get; init; }
    public string Artist { get; set; } = string.Empty;
    public string ReleaseYear { get; set; } = string.Empty;

    public Song(string title)
    {
        Title = title;
    }

    public Song(string title, string artist)
    {
        Title = title;
        Artist = artist;
    }

    public Song(string title, string artist, int releaseYear)
    {
        Title = title;
        Artist = artist;
        ReleaseYear = $"{releaseYear}";
    }
}