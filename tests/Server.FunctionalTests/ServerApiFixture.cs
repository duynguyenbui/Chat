using Chat.Server.Infrastructure;
using Chat.Server.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Testcontainers.PostgreSql;

namespace Server.FunctionalTests;

public sealed class ServerApiFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgreSqlContainer = new PostgreSqlBuilder().Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(async services =>
        {
            var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType ==
                     typeof(DbContextOptions<ChatContext>));

            services.Remove(dbContextDescriptor);

            services.AddDbContext<ChatContext>(optionsBuilder =>
            {
                optionsBuilder.UseNpgsql(_postgreSqlContainer.GetConnectionString());
            });
        });

        builder.UseEnvironment("Development");
    }

    public async Task InitializeAsync() => await _postgreSqlContainer.StartAsync();

    Task IAsyncLifetime.DisposeAsync() => _postgreSqlContainer.DisposeAsync().AsTask();
}