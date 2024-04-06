namespace Chat.Server.Models;

public class Message
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? Content { get; set; }
    public string? ImageFileName { get; set; }

    public bool Deleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string SenderId { get; set; }
    public User Sender { get; set; }

    public string ConversationId { get; set; }
    public Conversation Conversation { get; set; }

    public List<User>? Seen { get; set; }
}