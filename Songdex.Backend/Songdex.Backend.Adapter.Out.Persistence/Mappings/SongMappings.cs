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
            ReferenceLink = entity.ReferenceLink,
        };

    public static SongEntity ToDatabaseEntity(Song song)
        => new()
        {
            Id = song.Id.Value,
            Title = song.Title,
            Artist = song.Artist,
            ReleaseYear = song.ReleaseYear,
            ReferenceLink = song.ReferenceLink,
        };

    /// <summary>
    /// Copies everything but the id onto an entity already tracked by the context.
    /// </summary>
    public static void CopyInto(Song song, SongEntity target)
    {
        target.Title = song.Title;
        target.Artist = song.Artist;
        target.ReleaseYear = song.ReleaseYear;
        target.ReferenceLink = song.ReferenceLink;
    }
}
