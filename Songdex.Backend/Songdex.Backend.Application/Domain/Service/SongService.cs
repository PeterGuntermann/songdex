using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Application.Domain.Service;

public class SongService(ISongRepository songRepository) : IGetAllSongsUseCase
{
    public IEnumerable<Song> GetAllSongs()
    {
        return songRepository.GetAll().Result;
    }
}
