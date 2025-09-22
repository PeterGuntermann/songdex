using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Domain.Services;

public interface ICoversongsService
{
    IEnumerable<Song> GetAllSongs();
}