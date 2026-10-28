namespace Songdex.Backend.Application.Domain.Model;

public record SongId(string Value)
{
    public SongId() : this(Guid.NewGuid().ToString()[..8])
    {
    }
}
