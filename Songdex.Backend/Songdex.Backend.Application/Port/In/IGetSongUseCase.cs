using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Reads a single song; returns <c>null</c> when the id is unknown.
/// </summary>
public interface IGetSongUseCase
{
    Task<Song?> GetSong(SongId id);
}
