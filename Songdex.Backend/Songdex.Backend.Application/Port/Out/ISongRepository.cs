using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.Out;

/// <summary>
/// Outgoing port. Implemented by an adapter in <c>Songdex.Backend.Adapter.Out.*</c>; the
/// application does not know the persistence technology behind it.
/// </summary>
public interface ISongRepository
{
    Task<IEnumerable<Song>> GetAll();
}
