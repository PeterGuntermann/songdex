using Songdex.Backend.Adapter.Out.Persistence.Entities;
using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.Out.Persistence.Mappings;

public static class SongMappings
{
    public static Song ToDomainObject(SongEntity entity)
        => new()
        {
            Id = new SongId(entity.Id),
            Title = entity.Title,
            Artist = entity.Artist,
            ReleaseYear = entity.ReleaseYear,
        };

    public static SongEntity ToDatabaseEntity(Song song)
        => new()
        {
            Id = song.Id.Value,
            Title = song.Title,
            Artist = song.Artist,
            ReleaseYear = song.ReleaseYear,
        };
}
