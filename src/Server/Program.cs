var builder = WebApplication.CreateBuilder(args);

builder.AddApplicationServices();
builder.AddDefaultOpenApi();

var app = builder.Build();

app.UseDefaultOpenApi();

// app.UseAntiforgery();
app.UseCors("client");

app.MapGroup("/api/v1/identity").WithTags("Identity Apis")
    .MapUserApis<User>();

app.MapGroup("/api/v1/chat").WithTags("Chat Apis").MapChatApis()
    .RequireAuthorization();

app.MapHub<ChatHub>("/api/v1/notify");

app.Run();