using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. Adds a song to the catalogue and returns it with the id it was given.
/// </summary>
public interface ICreateSongUseCase
{
    Task<Song> CreateSong(Song song);
}
