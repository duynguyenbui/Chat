namespace Chat.Server.Services;

public interface IChatAI
{
    public Task<string?> Send(SendMessageInput input);
    public IAsyncEnumerable<string?> SendStream(string input);
}