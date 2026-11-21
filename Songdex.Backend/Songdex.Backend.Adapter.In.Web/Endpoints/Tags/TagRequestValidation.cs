namespace Songdex.Backend.Adapter.In.Web.Endpoints.Tags;

public static partial class TagsApi
{
    /// <summary>
    /// Mirrors the length limit of the persistence entity. Also applied to the tag names a song
    /// request carries.
    /// </summary>
    public const int MaxNameLength = 50;

    /// <summary>
    /// Returns the error message for a tag name, or <c>null</c> when the name is acceptable.
    /// </summary>
    internal static string? ValidateName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return "Tag name is required.";
        }

        return name.Trim().Length > MaxNameLength
            ? $"Tag name must not exceed {MaxNameLength} characters."
            : null;
    }

    private static Dictionary<string, string[]>? Validate(TagRequest request)
    {
        var error = ValidateName(request.Name);
        return error is null ? null : new Dictionary<string, string[]> { [nameof(TagRequest.Name)] = [error] };
    }
}
