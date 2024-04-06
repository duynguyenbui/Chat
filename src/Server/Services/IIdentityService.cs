namespace Chat.Server.Services;

public interface IIdentityService
{
    string GetUserIdentity();

    string GetUserName();

    Task<User?> GetCurrentUser();
}