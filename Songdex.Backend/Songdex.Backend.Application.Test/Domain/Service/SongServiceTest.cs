using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Domain.Service;

namespace Songdex.Backend.Application.Test.Domain.Service;

public class SongServiceTest
{
    private static readonly Song Angels = new()
    {
        Id = new SongId("aaaaaaaa"),
        Title = "Angels",
        Artist = "Robbie Williams",
    };

    private static readonly Song Shallow = new()
    {
        Id = new SongId("bbbbbbbb"),
        Title = "Shallow",
        Artist = "Lady Gaga & Bradley Cooper",
        ReleaseYear = 2018,
    };

    private static readonly Tag Acoustic = new() { Id = new TagId("tag00001"), Name = "Akustik" };

    private static SongService Service(params Song[] songs)
        => new(new InMemorySongRepository(songs), new InMemoryTagRepository());

    private static Tag[] Named(params string[] names) => [.. names.Select(name => new Tag { Name = name })];

    public class GetAllSongs
    {
        [Fact]
        public async Task ReturnsEverythingTheRepositoryHolds()
        {
            var service = Service(Angels, Shallow);

            var songs = await service.GetAllSongs();

            Assert.Equal([Angels, Shallow], songs);
        }

        [Fact]
        public async Task ReturnsEmptyOnAnEmptyCatalogue()
        {
            var service = Service();

            Assert.Empty(await service.GetAllSongs());
        }
    }

    public class GetSong
    {
        [Fact]
        public async Task ReturnsTheSongWithTheGivenId()
        {
            var service = Service(Angels, Shallow);

            Assert.Equal(Shallow, await service.GetSong(new SongId("bbbbbbbb")));
        }

        [Fact]
        public async Task ReturnsNullForAnUnknownId()
        {
            var service = Service(Angels);

            Assert.Null(await service.GetSong(new SongId("unknown1")));
        }
    }

    public class CreateSong
    {
        [Fact]
        public async Task StoresTheSongAndReturnsIt()
        {
            var service = Service();
            var song = new Song { Title = "Runaway", Artist = "Bon Jovi" };

            var created = await service.CreateSong(song);

            Assert.Equal(song.Id, created.Id);
            Assert.Equal("Runaway", created.Title);
            Assert.Equal(created, await service.GetSong(song.Id));
        }

        [Fact]
        public async Task GivesEverySongItsOwnGeneratedId()
        {
            var service = Service();

            var first = await service.CreateSong(new Song { Title = "Runaway" });
            var second = await service.CreateSong(new Song { Title = "Hurra" });

            Assert.NotEqual(first.Id, second.Id);
            Assert.Equal(2, (await service.GetAllSongs()).Count());
        }
    }

    public class CreateSongWithTags
    {
        [Fact]
        public async Task CreatesATagForAnUnknownName()
        {
            var tags = new InMemoryTagRepository();
            var service = new SongService(new InMemorySongRepository(), tags);

            var created = await service.CreateSong(new Song { Title = "Runaway", Tags = Named("Sommerfest") });

            var tag = Assert.Single(tags.Stored);
            Assert.Equal("Sommerfest", tag.Name);
            Assert.Equal([tag], created.Tags);
        }

        [Fact]
        public async Task ReusesAStoredTagIgnoringCaseAndKeepsItsSpelling()
        {
            var tags = new InMemoryTagRepository(Acoustic);
            var service = new SongService(new InMemorySongRepository(), tags);

            var created = await service.CreateSong(new Song { Title = "Angels", Tags = Named("AKUSTIK") });

            Assert.Equal([Acoustic], created.Tags);
            Assert.Equal([Acoustic], tags.Stored);
        }

        [Fact]
        public async Task CountsNamesThatDifferOnlyInCaseOnce()
        {
            var tags = new InMemoryTagRepository();
            var service = new SongService(new InMemorySongRepository(), tags);

            var created = await service.CreateSong(new Song
            {
                Title = "Hurra",
                Tags = Named("Punk", "punk", " PUNK "),
            });

            Assert.Equal("Punk", Assert.Single(created.Tags).Name);
            Assert.Single(tags.Stored);
        }

        [Fact]
        public async Task DropsBlankNamesAndTrimsTheRest()
        {
            var service = Service();

            var created = await service.CreateSong(new Song { Title = "Listen", Tags = Named("  ", " Soul ") });

            Assert.Equal("Soul", Assert.Single(created.Tags).Name);
        }

        [Fact]
        public async Task IgnoresTagIdsFromTheCaller()
        {
            var service = new SongService(new InMemorySongRepository(), new InMemoryTagRepository(Acoustic));

            var created = await service.CreateSong(new Song
            {
                Title = "Shallow",
                Tags = [new Tag { Id = new TagId("forged01"), Name = "Akustik" }],
            });

            Assert.Equal(Acoustic.Id, Assert.Single(created.Tags).Id);
        }
    }

    public class UpdateSong
    {
        [Fact]
        public async Task ReplacesAnExistingSongAndReturnsIt()
        {
            var service = Service(Angels);
            var changed = new Song
            {
                Id = Angels.Id,
                Title = "Angels",
                Artist = "Robbie Williams",
                ReleaseYear = 1997,
            };

            var updated = await service.UpdateSong(changed);

            Assert.Equal(changed.Id, updated?.Id);
            Assert.Equal(1997, updated?.ReleaseYear);
            Assert.Equal(1997, (await service.GetSong(Angels.Id))?.ReleaseYear);
        }

        [Fact]
        public async Task ReplacesTheWholeTagSet()
        {
            var tagged = new Song { Id = Angels.Id, Title = "Angels", Tags = [Acoustic] };
            var service = new SongService(new InMemorySongRepository(tagged), new InMemoryTagRepository(Acoustic));

            var updated = await service.UpdateSong(new Song
            {
                Id = Angels.Id,
                Title = "Angels",
                Tags = Named("einstudiert"),
            });

            Assert.Equal(["einstudiert"], updated?.Tags.Select(tag => tag.Name));
            Assert.Equal(["einstudiert"], (await service.GetSong(Angels.Id))?.Tags.Select(tag => tag.Name));
        }

        [Fact]
        public async Task ReturnsNullForAnUnknownIdAndStoresNothing()
        {
            var tags = new InMemoryTagRepository();
            var service = new SongService(new InMemorySongRepository(Angels), tags);

            var updated = await service.UpdateSong(new Song
            {
                Id = new SongId("unknown1"),
                Title = "Ghost",
                Tags = Named("Spuk"),
            });

            Assert.Null(updated);
            Assert.Single(await service.GetAllSongs());
            Assert.Empty(tags.Stored);
        }
    }

    public class DeleteSong
    {
        [Fact]
        public async Task RemovesTheSongAndReportsSuccess()
        {
            var service = Service(Angels, Shallow);

            Assert.True(await service.DeleteSong(Angels.Id));
            Assert.Equal([Shallow], await service.GetAllSongs());
        }

        [Fact]
        public async Task ReportsFailureForAnUnknownId()
        {
            var service = Service(Angels);

            Assert.False(await service.DeleteSong(new SongId("unknown1")));
            Assert.Single(await service.GetAllSongs());
        }
    }
}
