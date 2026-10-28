using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Replaces an existing song; returns <c>null</c> when the id is unknown.
/// </summary>
public interface IUpdateSongUseCase
{
    Task<Song?> UpdateSong(Song song);
}
