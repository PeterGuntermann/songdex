using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Domain.Service;

namespace Songdex.Backend.Application.Test.Domain.Service;

public class TagServiceTest
{
    private static readonly Tag Acoustic = new() { Id = new TagId("tag00001"), Name = "Akustik" };
    private static readonly Tag Rehearsed = new() { Id = new TagId("tag00002"), Name = "einstudiert" };

    public class GetAllTags
    {
        [Fact]
        public async Task ReturnsEveryTagSortedByNameIgnoringCase()
        {
            var summerParty = new Tag { Name = "Sommerfest" };
            var service = new TagService(new InMemoryTagRepository(summerParty, Rehearsed, Acoustic));

            var tags = await service.GetAllTags();

            Assert.Equal([Acoustic, Rehearsed, summerParty], tags);
        }

        [Fact]
        public async Task ReturnsEmptyWhenThereAreNoTags()
        {
            var service = new TagService(new InMemoryTagRepository());

            Assert.Empty(await service.GetAllTags());
        }
    }

    public class CreateTag
    {
        [Fact]
        public async Task StoresTheTagWithItsNameTrimmed()
        {
            var repository = new InMemoryTagRepository();
            var service = new TagService(repository);

            var created = await service.CreateTag(new Tag { Name = "  Akustik " });

            Assert.Equal("Akustik", created?.Name);
            Assert.Equal([created!], repository.Stored);
        }

        [Fact]
        public async Task RefusesANameThatExistsInAnotherCase()
        {
            var repository = new InMemoryTagRepository(Acoustic);
            var service = new TagService(repository);

            Assert.Null(await service.CreateTag(new Tag { Name = "AKUSTIK" }));
            Assert.Equal([Acoustic], repository.Stored);
        }
    }
}
