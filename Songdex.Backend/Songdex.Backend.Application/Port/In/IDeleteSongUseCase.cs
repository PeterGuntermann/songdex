using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Removes a song; returns <c>false</c> when the id is unknown.
/// </summary>
public interface IDeleteSongUseCase
{
    Task<bool> DeleteSong(SongId id);
}
