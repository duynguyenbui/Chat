namespace Chat.Server.Models;

public class SendMessageInput
{
    public string Text { get; set; } = "";
    public List<HistoryItem>? HistoryItems { get; set; } = [];
}

public class HistoryItem
{
    public string Role { get; set; } = "user";
    public string Content { get; set; } = "";
}