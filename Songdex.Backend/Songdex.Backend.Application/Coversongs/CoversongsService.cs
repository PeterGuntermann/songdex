using Songdex.Backend.Application.Abstractions;
using Songdex.Backend.Domain.Model;
using Songdex.Backend.Domain.Services;

namespace Songdex.Backend.Application.Coversongs;

public class CoversongsService(ISongRepository songRepository) : ICoversongsService
{
    public IEnumerable<Song> GetAllSongs()
    {
        var songs = songRepository.GetAll().Result;
        return new List<Song>
        {
            TestData.AnySong
        };
    }
}

