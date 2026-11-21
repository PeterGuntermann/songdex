using Songdex.Backend.Adapter.Out.Persistence.Entities;
using Songdex.Backend.Adapter.Out.Persistence.Mappings;
using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.Out.Persistence.Seeding;

public static class DataSeed
{
    private const string ExampleLink = "http://example.com";

    /// <summary>
    /// Builds a fresh set of entities on every call. Songs share the tag instances, so adding
    /// the songs inserts every tag exactly once.
    /// </summary>
    public static IEnumerable<SongEntity> Songs
    {
        get
        {
            var acoustic = NewTag("Akustik");
            var rehearsed = NewTag("einstudiert");
            var summerParty = NewTag("Sommerfest");

            return new List<(Song Song, TagEntity[] Tags)>
            {
                (new() { Title = "1000 und 1 Nacht (Zoom)" }, [summerParty]),
                (new()
                {
                    Title = "Angels", Artist = "Robbie Williams", Album = "Life thru a Lens",
                    Genre = "Pop", Language = "Englisch",
                }, [acoustic, rehearsed]),
                (new() { Title = "A night like this", Artist = "Caro Emerald", ReleaseYear = 2009 }, []),
                (new() { Title = "Runaway", Artist = "Bon Jovi", ReferenceLink = ExampleLink }, [rehearsed]),
                (new()
                {
                    Title = "Hurra", Artist = "Die Ärzte", ReferenceLink = ExampleLink,
                    Album = "Planet Punk", Genre = "Punk", Language = "Deutsch",
                    Notes = "Intro mit Hi-Hat zählen.\nZweite Strophe ohne Bass.",
                }, [rehearsed, summerParty]),
                (new() { Title = "Listen", Artist = "Beyoncé", ReferenceLink = ExampleLink }, []),
                (new()
                {
                    Title = "Shallow", Artist = "Lady Gaga & Bradley Cooper", ReferenceLink = ExampleLink,
                }, [acoustic]),
                (new() { Title = "Shut up and dance", Artist = "Walk The Moon", ReferenceLink = ExampleLink }, []),
            }.Select(seed =>
            {
                var entity = SongMappings.ToDatabaseEntity(seed.Song);
                entity.Tags.AddRange(seed.Tags);
                return entity;
            });
        }
    }

    private static TagEntity NewTag(string name) => TagMappings.ToDatabaseEntity(new Tag { Name = name });
}
