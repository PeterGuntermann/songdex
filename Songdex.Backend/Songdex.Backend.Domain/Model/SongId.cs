namespace Songdex.Backend.Domain.Model;

public record SongId(string Value)
{
    public SongId() : this(Guid.NewGuid().ToString())
    {
    }
}