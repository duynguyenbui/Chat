namespace Chat.Server.Extensions;

public static class ChatExtensions
{
    public static ConversationResponse MapToConversationResponse(this Conversation conversation, ChatOptions options)
        => new ConversationResponse(conversation.Id, conversation.Name, conversation.IsGroup,
            conversation.CreatedAt, conversation.UpdatedAt, conversation.LastMessageAt,
            (from message in conversation.Messages
                orderby message.CreatedAt
                select MapToMessageResponse(message, options)).ToList(),
            (from user in conversation.Users select MapToUserResponse(user)).ToList());

    public static MessageResponse MapToMessageResponse(this Message message, ChatOptions options)
        => new MessageResponse(message.Id, message.Content, message.ImageFileName,
            ChangeUriPlaceholder(options, message), message.CreatedAt, message.UpdatedAt,
            MapToUserResponse(message.Sender), (from user in message.Seen select MapToUserResponse(user)).ToList());

    public static UserResponse MapToUserResponse(this User user)
        => new UserResponse(user.Id, user.UserName, user.Image, user.Email);

    private static string? ChangeUriPlaceholder(ChatOptions options, Message message)
        => !string.IsNullOrEmpty(message.ImageFileName) ? options.PicBaseUrl.Replace("[0]", message.Id) : null;
}