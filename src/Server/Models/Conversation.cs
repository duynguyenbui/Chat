namespace Chat.Server.Models;

public class Conversation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? Name { get; set; }
    
    public bool IsGroup { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

    public List<Message>? Messages { get; set; }

    public List<User> Users { get; set; }
}