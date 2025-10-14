using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Domain.Services;

public interface ISongsService
{
    IEnumerable<Song> GetAllSongs();
}