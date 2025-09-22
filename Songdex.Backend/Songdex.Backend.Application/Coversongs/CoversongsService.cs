using Songdex.Backend.Domain.Model;
using Songdex.Backend.Domain.Services;

namespace Songdex.Backend.Application.Coversongs;

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

