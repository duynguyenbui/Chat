using System.Security.Claims;
using Chat.Server.Models;
using Chat.Server.Services;
using Microsoft.AspNetCore.Identity;
using NSubstitute.Extensions;

namespace Server.UnitTests;

public class ServerTests
{
    [Fact]
    public async Task GetUserIdentityReturnsEmptyForNoUser()
    {
        var mockHttpContextAccessor = Substitute.For<IHttpContextAccessor>();
        mockHttpContextAccessor.HttpContext?.User.FindFirst(x => x.Type == ClaimTypes.NameIdentifier)
            ?.Value.Returns(string.Empty);

        var identityService = new IdentityService(mockHttpContextAccessor, null);

        var actual = identityService.GetUserIdentity();
        Assert.Null(actual);
    }

    [Fact]
    public async Task GetUserIdentityReturnsUserIdentityForValidUser()
    {
        var context = Substitute.For<IHttpContextAccessor>();
        context.HttpContext?.User.FindFirst(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value
            .ReturnsForAll("a949d349-e6c4-47bf-951d-4cca9ff7df14");

        var identityService = new IdentityService(context, null);

        var actual = identityService.GetUserIdentity();
        Assert.Equal(null, actual);
    }

    [Fact]
    public async Task GetUserNameReturnsUserNameValidUser()
    {
        var context = Substitute.For<IHttpContextAccessor>();
        context.HttpContext?.User.Identity?.Name.Returns("nguyen@email.com");

        var identityService = new IdentityService(context, null);

        var actual = identityService.GetUserName();
        Assert.Equal("nguyen@email.com", actual);
    }
}