namespace Chat.Server.Models;

public class User : IdentityUser
{
    public string? Image { get; set; }
    
    public List<Conversation>? Conversations { get; set; }
    public List<Message>? Messages { get; set; }
    public List<Message>? SeenMessages { get; set; }
}