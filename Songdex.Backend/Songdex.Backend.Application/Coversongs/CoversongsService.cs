using Songdex.Backend.Domain.Model;
using Songdex.Backend.Domain.Services;

namespace Songdex.Backend.Application.Coversongs;

public class CoversongsService : ICoversongsService
{
    public IEnumerable<Song> GetAllSongs()
    {
        return new List<Song>
        {
            TestData.AnySong
        };
    }
}

