using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Application.Domain.Service;

/// <summary>
/// Bundles all use cases of the tag aggregate.
/// </summary>
public class TagService(ITagRepository tagRepository)
    : IGetAllTagsUseCase, ICreateTagUseCase, IRenameTagUseCase, IDeleteTagUseCase, IMergeTagsUseCase
{
    public async Task<IEnumerable<TagUsage>> GetAllTags()
    {
        var tags = await tagRepository.GetAllWithUsage();
        return tags.OrderBy(usage => usage.Tag.Name, StringComparer.InvariantCultureIgnoreCase).ToList();
    }

    public async Task<Tag?> CreateTag(Tag tag)
    {
        var existing = await tagRepository.GetByNames([tag.Name]);
        if (existing.Count > 0)
        {
            return null;
        }

        return await tagRepository.Add(new Tag { Id = tag.Id, Name = tag.Name.Trim() });
    }

    public async Task<TagChangeResult> RenameTag(TagId id, string name)
    {
        var trimmed = name.Trim();
        if (await tagRepository.GetById(id) is null)
        {
            return new TagChangeResult(TagChangeStatus.NotFound);
        }

        // The tag's own name may match: that is merely a change of spelling.
        var holders = await tagRepository.GetByNames([trimmed]);
        if (holders.Any(holder => holder.Id != id))
        {
            return new TagChangeResult(TagChangeStatus.NameTaken);
        }

        await tagRepository.Rename(id, trimmed);
        return new TagChangeResult(TagChangeStatus.Succeeded, await tagRepository.GetById(id));
    }

    public Task<bool> DeleteTag(TagId id)
    {
        return tagRepository.Delete(id);
    }

    public async Task<TagChangeResult> MergeTags(TagId source, TagId target)
    {
        if (source == target)
        {
            return new TagChangeResult(TagChangeStatus.SameTag);
        }

        if (!await tagRepository.Merge(source, target))
        {
            return new TagChangeResult(TagChangeStatus.NotFound);
        }

        return new TagChangeResult(TagChangeStatus.Succeeded, await tagRepository.GetById(target));
    }
}
