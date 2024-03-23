namespace Chat.Server.Models;

public record CreateConversationRequest(string? UserId, string[]? Members, string? Name, bool IsGroup = false);

public record CreateMessageRequest(string ConversationId, string? Content);

public record UserResponse(string Id, string Name, string Image, string Email);

public record MessageResponse(
    string MessageId,
    string Content,
    string? ImageFileName,
    string? ImageUri,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    UserResponse Sender,
    List<UserResponse>? Seen);

public record ConversationResponse(
    string ConversationId,
    string? Name,
    bool IsGroup,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime LastMessageAt,
    List<MessageResponse>? Messages,
    List<UserResponse> Users);