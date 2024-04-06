namespace Chat.Server.Exceptions;

/// <summary>
/// Exception type for app exceptions
/// </summary>
public class ChatException : Exception
{
    public ChatException()
    { }

    public ChatException(string message)
        : base(message)
    { }

    public ChatException(string message, Exception innerException)
        : base(message, innerException)
    { }
}