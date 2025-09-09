using Coversongs.Backend.Domain.Model;

namespace Coversongs.Backend.Domain.Services;

public interface ICoversongsService
{
    IEnumerable<Coversong> GetAllSongs();
}