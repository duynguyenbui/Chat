using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Chat.Server.Infrastructure;
using Chat.Server.Models;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Server.FunctionalTests;

public sealed class ServerApiTests : IClassFixture<ServerApiFixture>
{
    private readonly WebApplicationFactory<Program> _webApplicationFactory;
    private readonly HttpClient _httpClient;
    private const string userIdCreated = "03cf22cf-4999-45f9-886f-61d0ad2536a5";

    public ServerApiTests(ServerApiFixture fixture)
    {
        _webApplicationFactory = fixture;
        _httpClient = _webApplicationFactory.CreateClient();
        var request = new LoginRequest() { Email = "nguyen@email.com", Password = "Nguyen@123" };
        var response = _httpClient.PostAsJsonAsync($"/api/v1/identity/login", request).Result;
        var user = response.Content.ReadFromJsonAsync<AccessTokenResponse>().Result;

        if (user != null)
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", user.AccessToken);
    }

    [Fact]
    public async Task LoginWithValidUserRespectsForSuccess()
    {
        // Arrange
        var request = new LoginRequest() { Email = "nguyen@email.com", Password = "Nguyen@123" };
        // Action
        var response = await _httpClient.PostAsJsonAsync($"/api/v1/identity/login", request);
        // Assert
        if (response.IsSuccessStatusCode)
        {
            var user = await response.Content.ReadFromJsonAsync<AccessTokenResponse>();
            Assert.NotNull(user);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
        else
        {
            Assert.Fail("Cannot get user information");
        }
    }

    [Fact]
    public async Task CreateConversationWithValidInformationRespectsForHttpStatusCreated()
    {
        // Arrange
        var request = new CreateConversationRequest(userIdCreated, null, null, false);
        // Action
        var response = await _httpClient.PostAsJsonAsync($"/api/v1/chat/conversations", request);
        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}