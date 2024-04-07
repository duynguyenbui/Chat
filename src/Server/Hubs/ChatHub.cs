using Chat.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Chat.Server.Hubs;

public class ChatHub : Hub
{
    public async Task AddToGroup(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);

        await Clients.OthersInGroup(conversationId).SendAsync("join_group",
            $"{Context.ConnectionId} has joined the conversation with {conversationId}.");
    }

    public async Task RemoveFromGroup(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
        
        await Clients.OthersInGroup(conversationId)
            .SendAsync("leave_group", $"{Context.ConnectionId} has left the conversation {conversationId}.");
    }

    public class AvatarHub : Hub
    {
        public async Task UpdateAvatar(int userId, string avatarFileName)
        {
            await Clients.Users.UpdateAvatarAsync(Context.ConnectionId, userId, avatarFileName);

            await Clients.Users(userId.ToString()).SendAsync("update_avatar", avatarFileName);
        }

    }
}