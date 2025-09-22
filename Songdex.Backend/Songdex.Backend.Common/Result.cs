namespace Songdex.Backend.Common;

public class Result<T>
{
    public T? Value { get; set; }
    public string? FailureReason { get; set; }

    public static Result<T> Success(T value) => new()
    {
        Value = value
    };
    
    public static Result<T> Failure(string reason) => new()
    {
        FailureReason = reason
    };

    public bool IsSuccess() => Value is not null;
    public bool IsFailure() => FailureReason is not null;
}