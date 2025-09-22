using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Application.Abstractions;

public interface ISongRepository
{
    Task<IEnumerable<Song>> GetAll();
}