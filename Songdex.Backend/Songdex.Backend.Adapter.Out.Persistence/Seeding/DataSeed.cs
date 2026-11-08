using Songdex.Backend.Adapter.Out.Persistence.Entities;
using Songdex.Backend.Adapter.Out.Persistence.Mappings;
using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.Out.Persistence.Seeding;

public static class DataSeed
{
    private const string ExampleLink = "http://example.com";

    public static IEnumerable<SongEntity> Songs => new List<Song>
    {
        new() { Title = "1000 und 1 Nacht (Zoom)" },
        new()
        {
            Title = "Angels", Artist = "Robbie Williams", Album = "Life thru a Lens",
            Genre = "Pop", Language = "Englisch",
        },
        new() { Title = "A night like this", Artist = "Caro Emerald", ReleaseYear = 2009 },
        new() { Title = "Runaway", Artist = "Bon Jovi", ReferenceLink = ExampleLink },
        new()
        {
            Title = "Hurra", Artist = "Die Ärzte", ReferenceLink = ExampleLink,
            Album = "Planet Punk", Genre = "Punk", Language = "Deutsch",
            Notes = "Intro mit Hi-Hat zählen.\nZweite Strophe ohne Bass.",
        },
        new() { Title = "Listen", Artist = "Beyoncé", ReferenceLink = ExampleLink },
        new()
        {
            Title = "Shallow", Artist = "Lady Gaga & Bradley Cooper", ReferenceLink = ExampleLink,
        },
        new() { Title = "Shut up and dance", Artist = "Walk The Moon", ReferenceLink = ExampleLink },
    }.Select(SongMappings.ToDatabaseEntity);
}
