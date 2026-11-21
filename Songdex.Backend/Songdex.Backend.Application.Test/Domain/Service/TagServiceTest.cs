using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Domain.Service;

namespace Songdex.Backend.Application.Test.Domain.Service;

public class TagServiceTest
{
    private static readonly Tag Acoustic = new() { Id = new TagId("tag00001"), Name = "Akustik" };
    private static readonly Tag Rehearsed = new() { Id = new TagId("tag00002"), Name = "einstudiert" };
    private static readonly TagId Unknown = new("unknown1");

    public class GetAllTags
    {
        [Fact]
        public async Task ReturnsEveryTagSortedByNameIgnoringCase()
        {
            var summerParty = new Tag { Name = "Sommerfest" };
            var service = new TagService(new InMemoryTagRepository(summerParty, Rehearsed, Acoustic));

            var tags = await service.GetAllTags();

            Assert.Equal([Acoustic, Rehearsed, summerParty], tags.Select(usage => usage.Tag));
        }

        [Fact]
        public async Task ReportsHowManySongsCarryEachTag()
        {
            var repository = new InMemoryTagRepository(Acoustic, Rehearsed);
            repository.SongCounts[Acoustic.Id.Value] = 3;
            var service = new TagService(repository);

            var tags = await service.GetAllTags();

            Assert.Equal([3, 0], tags.Select(usage => usage.SongCount));
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

    public class RenameTag
    {
        [Fact]
        public async Task GivesTheTagTheTrimmedNewName()
        {
            var repository = new InMemoryTagRepository(Acoustic, Rehearsed);
            var service = new TagService(repository);

            var result = await service.RenameTag(Acoustic.Id, "  Unplugged ");

            Assert.Equal(TagChangeStatus.Succeeded, result.Status);
            Assert.Equal("Unplugged", result.Tag?.Tag.Name);
            Assert.Equal(Acoustic.Id, result.Tag?.Tag.Id);
            Assert.Equal(["Unplugged", "einstudiert"], repository.Stored.Select(tag => tag.Name));
        }

        [Fact]
        public async Task AllowsChangingOnlyTheSpellingOfItsOwnName()
        {
            var service = new TagService(new InMemoryTagRepository(Rehearsed));

            var result = await service.RenameTag(Rehearsed.Id, "Einstudiert");

            Assert.Equal(TagChangeStatus.Succeeded, result.Status);
            Assert.Equal("Einstudiert", result.Tag?.Tag.Name);
        }

        [Fact]
        public async Task RefusesTheNameOfAnotherTagRegardlessOfCase()
        {
            var repository = new InMemoryTagRepository(Acoustic, Rehearsed);
            var service = new TagService(repository);

            var result = await service.RenameTag(Rehearsed.Id, "akustik");

            Assert.Equal(TagChangeStatus.NameTaken, result.Status);
            Assert.Null(result.Tag);
            Assert.Equal([Acoustic, Rehearsed], repository.Stored);
        }

        [Fact]
        public async Task ReportsAnUnknownTag()
        {
            var service = new TagService(new InMemoryTagRepository(Acoustic));

            var result = await service.RenameTag(Unknown, "Ghost");

            Assert.Equal(TagChangeStatus.NotFound, result.Status);
        }
    }

    public class DeleteTag
    {
        [Fact]
        public async Task RemovesTheTagAndReportsSuccess()
        {
            var repository = new InMemoryTagRepository(Acoustic, Rehearsed);
            var service = new TagService(repository);

            Assert.True(await service.DeleteTag(Acoustic.Id));
            Assert.Equal([Rehearsed], repository.Stored);
        }

        [Fact]
        public async Task ReportsFailureForAnUnknownId()
        {
            var service = new TagService(new InMemoryTagRepository(Acoustic));

            Assert.False(await service.DeleteTag(Unknown));
        }
    }

    public class MergeTags
    {
        [Fact]
        public async Task FoldsTheSourceIntoTheTargetAndReturnsTheTarget()
        {
            var repository = new InMemoryTagRepository(Acoustic, Rehearsed);
            repository.SongCounts[Rehearsed.Id.Value] = 2;
            var service = new TagService(repository);

            var result = await service.MergeTags(Acoustic.Id, Rehearsed.Id);

            Assert.Equal(TagChangeStatus.Succeeded, result.Status);
            Assert.Equal(new TagUsage(Rehearsed, 2), result.Tag);
            Assert.Equal([(Acoustic.Id, Rehearsed.Id)], repository.Merges);
        }

        [Fact]
        public async Task RefusesToMergeATagIntoItself()
        {
            var repository = new InMemoryTagRepository(Acoustic);
            var service = new TagService(repository);

            var result = await service.MergeTags(Acoustic.Id, new TagId(Acoustic.Id.Value));

            Assert.Equal(TagChangeStatus.SameTag, result.Status);
            Assert.Empty(repository.Merges);
        }

        [Fact]
        public async Task ReportsAnUnknownSourceOrTarget()
        {
            var service = new TagService(new InMemoryTagRepository(Acoustic));

            Assert.Equal(TagChangeStatus.NotFound, (await service.MergeTags(Unknown, Acoustic.Id)).Status);
            Assert.Equal(TagChangeStatus.NotFound, (await service.MergeTags(Acoustic.Id, Unknown)).Status);
        }
    }
}
