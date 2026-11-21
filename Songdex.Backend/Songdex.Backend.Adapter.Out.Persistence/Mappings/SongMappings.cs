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
            Notes = entity.Notes,
            Genre = entity.Genre,
            Language = entity.Language,
            Album = entity.Album,
            Tags = entity.Tags.Select(TagMappings.ToDomainObject).ToList(),
        };

    /// <summary>
    /// Leaves <see cref="SongEntity.Tags"/> empty: tags are shared rows, so the repository attaches
    /// the stored ones instead of creating a copy per song.
    /// </summary>
    public static SongEntity ToDatabaseEntity(Song song)
        => new()
        {
            Id = song.Id.Value,
            Title = song.Title,
            Artist = song.Artist,
            ReleaseYear = song.ReleaseYear,
            ReferenceLink = song.ReferenceLink,
            Notes = song.Notes,
            Genre = song.Genre,
            Language = song.Language,
            Album = song.Album,
        };

    /// <summary>
    /// Copies everything but the id and the tags onto an entity already tracked by the context.
    /// </summary>
    public static void CopyInto(Song song, SongEntity target)
    {
        target.Title = song.Title;
        target.Artist = song.Artist;
        target.ReleaseYear = song.ReleaseYear;
        target.ReferenceLink = song.ReferenceLink;
        target.Notes = song.Notes;
        target.Genre = song.Genre;
        target.Language = song.Language;
        target.Album = song.Album;
    }
}
