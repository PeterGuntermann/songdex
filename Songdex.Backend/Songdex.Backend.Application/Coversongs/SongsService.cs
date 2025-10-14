using Songdex.Backend.Application.Abstractions;
using Songdex.Backend.Domain.Model;
using Songdex.Backend.Domain.Services;

namespace Songdex.Backend.Application.Coversongs;

public class SongsService(ISongRepository songRepository) : ISongsService
{
    public IEnumerable<Song> GetAllSongs()
    {
        return songRepository.GetAll().Result;
    }
}