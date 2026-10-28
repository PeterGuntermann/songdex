using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Application.Domain.Service;

/// <summary>
/// Bundles all use cases of the song aggregate.
/// </summary>
public class SongService(ISongRepository songRepository)
    : IGetAllSongsUseCase, IGetSongUseCase, ICreateSongUseCase, IUpdateSongUseCase, IDeleteSongUseCase
{
    public Task<IEnumerable<Song>> GetAllSongs()
    {
        return songRepository.GetAll();
    }

    public Task<Song?> GetSong(SongId id)
    {
        return songRepository.GetById(id);
    }

    public Task<Song> CreateSong(Song song)
    {
        return songRepository.Add(song);
    }

    public async Task<Song?> UpdateSong(Song song)
    {
        return await songRepository.Update(song) ? song : null;
    }

    public Task<bool> DeleteSong(SongId id)
    {
        return songRepository.Delete(id);
    }
}
