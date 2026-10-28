using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Application.Port.In;

/// <summary>
/// Incoming port. The only way an incoming adapter is allowed to read the catalogue.
/// </summary>
public interface IGetAllSongsUseCase
{
    Task<IEnumerable<Song>> GetAllSongs();
}
