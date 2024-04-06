using Microsoft.AspNetCore.Antiforgery;

namespace Chat.Server.Apis;

public static class ChatApis
{
    public static RouteGroupBuilder MapChatApis(this RouteGroupBuilder app)
    {
        // Routes for querying conversations.
        app.MapGet("/conversations/{conversationId:minlength(1)}", GetConversationById);
        app.MapGet("/conversations/by/user/{userId:minlength(1)}", GetConversationByUserId);
        app.MapPost("/conversations/{conversationId:minlength(1)}/seen", SeenConversation);

        // Routes for modify conversation.
        app.MapPost("/conversations", CreateConversation);
        app.MapDelete("/conversations/{conversationId:minlength(1)}", DeleteConversation);

        // Routes for messages.
        app.MapPost("/messages", CreateMessage);
        // app.MapGet("antiforgery/token", (IAntiforgery forgeryService, HttpContext context) =>
        // {
        //     var tokens = forgeryService.GetAndStoreTokens(context);
        //     var xsrfToken = tokens.RequestToken!;
        //     return TypedResults.Content(xsrfToken, "text/plain");
        // });
        //.RequireAuthorization(); // In a real world scenario, you'll only give this token to authorized users

        app.MapPost("/messages/pics", CreateImageMessage).DisableAntiforgery();
        app.MapGet("/messages/{messageId:minlength(1)}/pic", GetMessagePictureById).AllowAnonymous();
        app.MapDelete("/messages/{messageId:minlength(1)}", DeleteMessage);

        return app;
    }

    public static async Task<Results<Ok<string>, BadRequest<string>>> SeenConversation(
        [AsParameters] ChatServices services, [FromHeader(Name = "x-connectionid")] string? connectionId,
        string conversationId)
    {
        var user = await services.IdentityService.GetCurrentUser();

        if (user is null) return TypedResults.BadRequest("Missing Credentials");

        var conversation = await services.Context.Conversations
            .Include(conversation => conversation.Users)
            .Include(conversation => conversation.Messages)
            .ThenInclude(list => list.Seen)
            .Where(conversation => conversation.Id == conversationId)
            .FirstOrDefaultAsync();

        if (conversation is null) return TypedResults.BadRequest($"Cannot find this conversation {conversationId}");

        if (!conversation.Users.Contains(user))
            return TypedResults.BadRequest($"User is not in this conversation {conversationId}");

        foreach (var message in conversation.Messages.Where(message => !message.Seen.Contains(user)))
        {
            message.Seen = [..message.Seen, user];
        }

        // TODO: Check authentication
        if (!string.IsNullOrEmpty(connectionId))
        {
            await services.HubContext.Clients.GroupExcept(conversationId, connectionId)
                .SendAsync("seen_conversation", conversation.MapToConversationResponse(services.Options.Value));
        }

        await services.Context.SaveChangesAsync();

        return TypedResults.Ok(
            $"Seen conversation successfully with Conversation {conversationId} and User: {user.Id}");
    }

    public static async Task<Results<Ok<MessageResponse>, BadRequest<string>, UnauthorizedHttpResult>> CreateMessage(
        [AsParameters] ChatServices services, [FromHeader(Name = "x-connectionid")] string? connectionId,
        CreateMessageRequest request)
    {
        var user = await services.IdentityService.GetCurrentUser();

        if (user is null) return TypedResults.Unauthorized();

        if (string.IsNullOrEmpty(request.ConversationId) || string.IsNullOrEmpty(request.Content))
        {
            return TypedResults.BadRequest("Missing data");
        }

        var conversation = await services.Context.Conversations
            .Include(conversation => conversation.Messages)
            .Include(conversation => conversation.Users)
            .FirstOrDefaultAsync(x => string.Equals(x.Id, request.ConversationId));

        if (conversation is null)
            return TypedResults.BadRequest($"Couldn't find this conversation {request.ConversationId}");

        if (!conversation.Users.Contains(user))
            return TypedResults.BadRequest(
                $"Couldn't find user with {user.Id} in this conversation {request.ConversationId}");

        var message = new Message
        {
            Content = request.Content,
            Sender = user,
            ImageFileName = string.Empty,
            Conversation = conversation,
            Seen = [user]
        };

        conversation.Messages?.Add(message);
        conversation.LastMessageAt = DateTime.UtcNow;

        var result = await services.Context.SaveChangesAsync();

        // TODO: Check authentication
        if (!string.IsNullOrEmpty(connectionId))
            await services.HubContext.Clients.GroupExcept(conversation.Id, connectionId)
                .SendAsync("message_created", message.MapToMessageResponse(services.Options.Value));

        if (result < 0) return TypedResults.BadRequest("Something went wrong");

        return TypedResults.Ok(message.MapToMessageResponse(services.Options.Value));
    }

    public static async Task<Results<Ok<MessageResponse>, BadRequest<string>, UnauthorizedHttpResult>>
        CreateImageMessage([AsParameters] ChatServices services,
            string conversationId,
            IFormFile? image)
    {
        var user = await services.IdentityService.GetCurrentUser();

        if (user is null) return TypedResults.Unauthorized();

        if (image is null)
        {
            return TypedResults.BadRequest("Missing data");
        }

        var conversation = await services.Context.Conversations
            .Include(conversation => conversation.Messages)
            .Include(conversation => conversation.Users)
            .FirstOrDefaultAsync(x => string.Equals(x.Id, conversationId));

        if (conversation is null)
            return TypedResults.BadRequest($"Couldn't find this conversation {conversationId}");

        if (!conversation.Users.Contains(user))
            return TypedResults.BadRequest(
                $"Couldn't find user with {user.Id} in this conversation {conversationId}");

        var message = new Message
        {
            Sender = user,
            ImageFileName = string.Empty,
            Conversation = conversation,
            Seen = [user]
        };

        try
        {
            // Save Image
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Pics");

            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            var fileName = message.Id + Path.GetExtension(image.FileName);
            var filePath = Path.Combine(uploadsPath, fileName);

            message.ImageFileName = fileName;
            await using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }

        conversation.Messages?.Add(message);
        conversation.LastMessageAt = DateTime.UtcNow;

        var result = await services.Context.SaveChangesAsync();

        await services.HubContext.Clients.All
            .SendAsync("message_created", message.MapToMessageResponse(services.Options.Value));

        if (result < 0) return TypedResults.BadRequest("Something went wrong");

        return TypedResults.Ok(message.MapToMessageResponse(services.Options.Value));
    }


    public static async Task<Results<NoContent, NotFound>> DeleteMessage([AsParameters] ChatServices services,
        string messageId)
    {
        var message = await services.Context.Messages.FindAsync(messageId);

        if (message is null)
        {
            return TypedResults.NotFound();
        }

        services.Context.Messages.Remove(message);
        await services.Context.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    public static async Task<Results<Ok<List<ConversationResponse>>, BadRequest<string>>> GetConversationByUserId(
        [AsParameters] ChatServices services, string userId)
    {
        var currentUserId = services.IdentityService.GetUserIdentity();

        if (currentUserId != userId || string.IsNullOrEmpty(currentUserId) ||
            string.IsNullOrEmpty(userId))
        {
            TypedResults.BadRequest("Invalid credentials");
        }

        var user = await services.IdentityService.GetCurrentUser();

        var conversations = services.Context.Conversations
            .Include(conversation => conversation.Users)
            .Include(conversation => conversation.Messages)
            .ThenInclude(message => message.Seen)
            .Where(conversation => conversation.Users.Contains(user)).ToImmutableList();

        if (conversations is null) return TypedResults.BadRequest($"Couldn't find conversation with User: {userId}");

        var conversationResponses = new List<ConversationResponse>();
        conversations.ForEach(conversation =>
            conversationResponses.Add(conversation.MapToConversationResponse(services.Options.Value)));

        return TypedResults.Ok(conversationResponses);
    }

    public static async Task<Results<Created, BadRequest<string>, UnauthorizedHttpResult>> CreateConversation(
        [AsParameters] ChatServices services, CreateConversationRequest request)
    {
        var user = await services.IdentityService.GetCurrentUser();

        if (user is null) return TypedResults.Unauthorized();

        if (request.IsGroup &&
            (request?.Members?.Length < 2 || string.IsNullOrEmpty(request?.Name)))
        {
            return TypedResults.BadRequest("Invalid data");
        }

        if (request.IsGroup)
        {
            if (string.IsNullOrEmpty(request.Name))
            {
                return TypedResults.BadRequest("Invalid data");
            }

            var users = await services.UserManager.Users
                .Where(u => request.Members != null && request.Members.Contains(u.Id))
                .ToListAsync();

            var enumerable = users.Append(user);

            var existingGroupConversation = await services.Context.Conversations
                .Include(c => c.Users)
                .Where(c => c.IsGroup && c.Name == request.Name && c.Users.Count == request.Members.Length + 1 &&
                            c.Users.All(u => enumerable.Contains(u)))
                .FirstOrDefaultAsync();

            if (existingGroupConversation != null && existingGroupConversation.Name == request.Name)
            {
                return TypedResults.BadRequest("Group conversation already exists with specified members");
            }

            var groupConversation = new Conversation
            {
                Name = request.Name, IsGroup = true, Users = [..users, user]
            };

            await services.Context.Conversations.AddAsync(groupConversation);

            await services.Context.SaveChangesAsync();

            // TODO: Update all connections with new conversation
            return TypedResults.Created($"/api/v1/chat/conversations/{groupConversation.Id}");
        }

        if (string.IsNullOrEmpty(request.UserId))
        {
            return TypedResults.BadRequest("UserId is required");
        }

        var userPair = await services.UserManager.FindByIdAsync(request.UserId);

        if (userPair is null)
        {
            return TypedResults.BadRequest("Missing data for user");
        }

        var existingConversation = await services.Context.Conversations
            .Where(conversation => conversation.Users.Contains(user) && conversation.Users.Contains(userPair) &&
                                   !conversation.IsGroup)
            .FirstOrDefaultAsync();

        if (existingConversation is not null)
        {
            return TypedResults.BadRequest("Conversation already exists");
        }

        var conversation = new Conversation
        {
            IsGroup = false, Users = [user, userPair]
        };

        await services.Context.Conversations.AddAsync(conversation);

        await services.Context.SaveChangesAsync();

        return TypedResults.Created($"/api/v1/chat/conversations/{conversation.Id}");
    }

    public static async Task<Results<Ok<ConversationResponse>, BadRequest<string>, UnauthorizedHttpResult, NotFound>>
        GetConversationById([AsParameters] ChatServices services, string conversationId)
    {
        var user = await services.IdentityService.GetCurrentUser();

        if (user is null) return TypedResults.Unauthorized();

        var conversation = await services.Context.Conversations
            .Include(conversation => conversation.Users)
            .Include(conversation => conversation.Messages)
            .ThenInclude(message => message.Seen)
            .Where(x => x.Id == conversationId)
            .FirstOrDefaultAsync();

        if (conversation is null)
        {
            return TypedResults.NotFound();
        }

        if (!conversation.Users.Contains(user))
        {
            return TypedResults.BadRequest($"Cannot find user with {user.Id} in this conversation");
        }

        return TypedResults.Ok(conversation.MapToConversationResponse(services.Options.Value));
    }

    public static async Task<Results<NoContent, NotFound>> DeleteConversation([AsParameters] ChatServices services,
        string conversationId)
    {
        var item = services.Context.Conversations.SingleOrDefault(x => x.Id == conversationId);

        if (item is null)
        {
            return TypedResults.NotFound();
        }

        services.Context.Conversations.Remove(item);
        await services.Context.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    public static async Task<Results<PhysicalFileHttpResult, NotFound>> GetMessagePictureById(ChatContext context,
        IWebHostEnvironment environment,
        string messageId)
    {
        var item = await context.Messages.FindAsync(messageId);

        if (item is null)
        {
            return TypedResults.NotFound();
        }

        var path = GetFullPath(environment.ContentRootPath, item.ImageFileName);

        var imageFileExtension = Path.GetExtension(item.ImageFileName);
        if (imageFileExtension != null)
        {
            var mimetype = GetImageMimeTypeFromImageFileExtension(imageFileExtension);
            var lastModified = File.GetLastWriteTimeUtc(path);

            return TypedResults.PhysicalFile(path, mimetype, lastModified: lastModified);
        }

        return TypedResults.NotFound();
    }

    private static string GetImageMimeTypeFromImageFileExtension(string extension) => extension switch
    {
        ".png" => "image/png",
        ".gif" => "image/gif",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".bmp" => "image/bmp",
        ".tiff" => "image/tiff",
        ".wmf" => "image/wmf",
        ".jp2" => "image/jp2",
        ".svg" => "image/svg+xml",
        ".webp" => "image/webp",
        _ => "application/octet-stream",
    };

    public static string GetFullPath(string contentRootPath, string? pictureFileName) =>
        Path.Combine(contentRootPath, "Pics", pictureFileName);
}