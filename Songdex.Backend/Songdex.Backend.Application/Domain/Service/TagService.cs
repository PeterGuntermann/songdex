using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Application.Domain.Service;

/// <summary>
/// Bundles all use cases of the tag aggregate.
/// </summary>
public class TagService(ITagRepository tagRepository) : IGetAllTagsUseCase, ICreateTagUseCase
{
    public async Task<IEnumerable<Tag>> GetAllTags()
    {
        var tags = await tagRepository.GetAll();
        return tags.OrderBy(tag => tag.Name, StringComparer.InvariantCultureIgnoreCase).ToList();
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
}
