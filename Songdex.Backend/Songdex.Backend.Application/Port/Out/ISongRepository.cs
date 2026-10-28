using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.Out;

/// <summary>
/// Outgoing port. Implemented by an adapter in <c>Songdex.Backend.Adapter.Out.*</c>; the
/// application does not know the persistence technology behind it.
/// </summary>
public interface ISongRepository
{
    Task<IEnumerable<Song>> GetAll();

    /// <returns>The song, or <c>null</c> when no song with that id is stored.</returns>
    Task<Song?> GetById(SongId id);

    Task<Song> Add(Song song);

    /// <returns><c>false</c> when no song with that id is stored.</returns>
    Task<bool> Update(Song song);

    /// <returns><c>false</c> when no song with that id is stored.</returns>
    Task<bool> Delete(SongId id);
}
