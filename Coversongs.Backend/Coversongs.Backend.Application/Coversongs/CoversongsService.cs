using Coversongs.Backend.Domain.Model;
using Coversongs.Backend.Domain.Services;

namespace Coversongs.Backend.Application.Coversongs;

public class CoversongsService : ICoversongsService
{
    public IEnumerable<Coversong> GetAllSongs()
    {
        return new List<Coversong>
        {
            TestData.AnyCoversong
        };
    }
}

