namespace Songdex.Backend.Application.Domain.Model;

public record TagId(string Value)
{
    public TagId() : this(Guid.NewGuid().ToString()[..8])
    {
    }
}
