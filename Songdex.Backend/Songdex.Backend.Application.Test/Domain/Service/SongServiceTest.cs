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

    public class GetAllSongs
    {
        [Fact]
        public async Task ReturnsEverythingTheRepositoryHolds()
        {
            var service = new SongService(new InMemorySongRepository(Angels, Shallow));

            var songs = await service.GetAllSongs();

            Assert.Equal([Angels, Shallow], songs);
        }

        [Fact]
        public async Task ReturnsEmptyOnAnEmptyCatalogue()
        {
            var service = new SongService(new InMemorySongRepository());

            Assert.Empty(await service.GetAllSongs());
        }
    }

    public class GetSong
    {
        [Fact]
        public async Task ReturnsTheSongWithTheGivenId()
        {
            var service = new SongService(new InMemorySongRepository(Angels, Shallow));

            Assert.Equal(Shallow, await service.GetSong(new SongId("bbbbbbbb")));
        }

        [Fact]
        public async Task ReturnsNullForAnUnknownId()
        {
            var service = new SongService(new InMemorySongRepository(Angels));

            Assert.Null(await service.GetSong(new SongId("unknown1")));
        }
    }

    public class CreateSong
    {
        [Fact]
        public async Task StoresTheSongAndReturnsIt()
        {
            var service = new SongService(new InMemorySongRepository());
            var song = new Song { Title = "Runaway", Artist = "Bon Jovi" };

            var created = await service.CreateSong(song);

            Assert.Equal(song, created);
            Assert.Equal(song, await service.GetSong(song.Id));
        }

        [Fact]
        public async Task GivesEverySongItsOwnGeneratedId()
        {
            var service = new SongService(new InMemorySongRepository());

            var first = await service.CreateSong(new Song { Title = "Runaway" });
            var second = await service.CreateSong(new Song { Title = "Hurra" });

            Assert.NotEqual(first.Id, second.Id);
            Assert.Equal(2, (await service.GetAllSongs()).Count());
        }
    }

    public class UpdateSong
    {
        [Fact]
        public async Task ReplacesAnExistingSongAndReturnsIt()
        {
            var service = new SongService(new InMemorySongRepository(Angels));
            var changed = new Song
            {
                Id = Angels.Id,
                Title = "Angels",
                Artist = "Robbie Williams",
                ReleaseYear = 1997,
            };

            var updated = await service.UpdateSong(changed);

            Assert.Equal(changed, updated);
            Assert.Equal(1997, (await service.GetSong(Angels.Id))?.ReleaseYear);
        }

        [Fact]
        public async Task ReturnsNullForAnUnknownIdAndStoresNothing()
        {
            var service = new SongService(new InMemorySongRepository(Angels));

            var updated = await service.UpdateSong(new Song
            {
                Id = new SongId("unknown1"),
                Title = "Ghost",
            });

            Assert.Null(updated);
            Assert.Single(await service.GetAllSongs());
        }
    }

    public class DeleteSong
    {
        [Fact]
        public async Task RemovesTheSongAndReportsSuccess()
        {
            var service = new SongService(new InMemorySongRepository(Angels, Shallow));

            Assert.True(await service.DeleteSong(Angels.Id));
            Assert.Equal([Shallow], await service.GetAllSongs());
        }

        [Fact]
        public async Task ReportsFailureForAnUnknownId()
        {
            var service = new SongService(new InMemorySongRepository(Angels));

            Assert.False(await service.DeleteSong(new SongId("unknown1")));
            Assert.Single(await service.GetAllSongs());
        }
    }
}
