using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Identity.Data;

namespace Chat.Server.Apis;

public static class UserApis
{
    private static readonly EmailAddressAttribute _emailAddressAttribute = new();

    public static IEndpointConventionBuilder MapUserApis<TUser>(this IEndpointRouteBuilder endpoints)
        where TUser : User, new()
    {
        ArgumentNullException.ThrowIfNull(endpoints);

        var timeProvider = endpoints.ServiceProvider.GetRequiredService<TimeProvider>();
        var bearerTokenOptions = endpoints.ServiceProvider.GetRequiredService<IOptionsMonitor<BearerTokenOptions>>();
        var emailSender = endpoints.ServiceProvider.GetRequiredService<IEmailSender<TUser>>();
        var linkGenerator = endpoints.ServiceProvider.GetRequiredService<LinkGenerator>();

        // We'll figure out a unique endpoint name based on the final route pattern during endpoint generation.
        string? confirmEmailEndpointName = null;

        var routeGroup = endpoints.MapGroup("");

        // NOTE: We cannot inject UserManager<TUser> directly because the TUser generic parameter is currently unsupported by RDG.
        // https://github.com/dotnet/aspnetcore/issues/47338
        routeGroup.MapPost("/register", async Task<Results<Ok, ValidationProblem>>
            ([FromBody] RegisterRequest registration, [FromServices] IServiceProvider sp) =>
        {
            var userManager = sp.GetRequiredService<UserManager<TUser>>();

            if (!userManager.SupportsUserEmail)
            {
                throw new NotSupportedException($"{nameof(MapUserApis)} requires a user store with email support.");
            }

            var userStore = sp.GetRequiredService<IUserStore<TUser>>();
            var emailStore = (IUserEmailStore<TUser>)userStore;
            var email = registration.Email;

            if (string.IsNullOrEmpty(email) || !_emailAddressAttribute.IsValid(email))
            {
                return CreateValidationProblem(IdentityResult.Failed(userManager.ErrorDescriber.InvalidEmail(email)));
            }

            var user = new TUser();
            await userStore.SetUserNameAsync(user, email, CancellationToken.None);
            await emailStore.SetEmailAsync(user, email, CancellationToken.None);
            var result = await userManager.CreateAsync(user, registration.Password);

            if (!result.Succeeded)
            {
                return CreateValidationProblem(result);
            }

            // We don't need email confirmation
            // await SendConfirmationEmailAsync(user, userManager, context, email);
            return TypedResults.Ok();
        });

        routeGroup.MapPost("/login", async Task<Results<Ok<AccessTokenResponse>, EmptyHttpResult, ProblemHttpResult>>
        ([FromBody] LoginRequest login, [FromQuery] bool? useCookies, [FromQuery] bool? useSessionCookies,
            [FromServices] IServiceProvider sp) =>
        {
            var signInManager = sp.GetRequiredService<SignInManager<TUser>>();

            var useCookieScheme = (useCookies == true) || (useSessionCookies == true);
            var isPersistent = (useCookies == true) && (useSessionCookies != true);
            signInManager.AuthenticationScheme =
                useCookieScheme ? IdentityConstants.ApplicationScheme : IdentityConstants.BearerScheme;

            var result =
                await signInManager.PasswordSignInAsync(login.Email, login.Password, isPersistent,
                    lockoutOnFailure: true);

            if (result.RequiresTwoFactor)
            {
                if (!string.IsNullOrEmpty(login.TwoFactorCode))
                {
                    result = await signInManager.TwoFactorAuthenticatorSignInAsync(login.TwoFactorCode, isPersistent,
                        rememberClient: isPersistent);
                }
                else if (!string.IsNullOrEmpty(login.TwoFactorRecoveryCode))
                {
                    result = await signInManager.TwoFactorRecoveryCodeSignInAsync(login.TwoFactorRecoveryCode);
                }
            }

            if (!result.Succeeded)
            {
                return TypedResults.Problem(result.ToString(), statusCode: StatusCodes.Status401Unauthorized);
            }

            // The signInManager already produced the needed response in the form of a cookie or bearer token.
            return TypedResults.Empty;
        });

        routeGroup.MapPost("/refresh",
            async Task<Results<Ok<AccessTokenResponse>, UnauthorizedHttpResult, SignInHttpResult, ChallengeHttpResult>>
                ([FromBody] RefreshRequest refreshRequest, [FromServices] IServiceProvider sp) =>
            {
                var signInManager = sp.GetRequiredService<SignInManager<TUser>>();
                var refreshTokenProtector =
                    bearerTokenOptions.Get(IdentityConstants.BearerScheme).RefreshTokenProtector;
                var refreshTicket = refreshTokenProtector.Unprotect(refreshRequest.RefreshToken);

                // Reject the /refresh attempt with a 401 if the token expired or the security stamp validation fails
                if (refreshTicket?.Properties?.ExpiresUtc is not { } expiresUtc ||
                    timeProvider.GetUtcNow() >= expiresUtc ||
                    await signInManager.ValidateSecurityStampAsync(refreshTicket.Principal) is not TUser user)

                {
                    return TypedResults.Challenge();
                }

                var newPrincipal = await signInManager.CreateUserPrincipalAsync(user);
                return TypedResults.SignIn(newPrincipal, authenticationScheme: IdentityConstants.BearerScheme);
            });

        routeGroup.MapGet("/users/all",
            async Task<Results<Ok<List<UserResponse>>, NotFound>> (ClaimsPrincipal claimsPrincipal,
                [FromServices] IServiceProvider sp) =>
            {
                var userManager = sp.GetRequiredService<UserManager<TUser>>();
                var options = sp.GetRequiredService<IOptions<ChatOptions>>();
                if (await userManager.GetUserAsync(claimsPrincipal) is not { } user)
                {
                    return TypedResults.NotFound();
                }

                var users = await userManager.Users
                    .Where(u => u.Id != user.Id && u.Id != "b91a9cb7-fa92-4683-b5bd-51e7fd20eace")
                    .Select(u => u.MapToUserResponse(options.Value))
                    .ToListAsync();

                return TypedResults.Ok(users);
            }).RequireAuthorization();


        routeGroup.MapPost("users/avatar",
            async Task<Results<Ok<string>, BadRequest<string>, UnauthorizedHttpResult>> (
                [FromServices] IServiceProvider sp, IFormFile image) =>
            {
                using var scope = sp.CreateScope();
                // Inject all services needed for user avatar
                var options = scope.ServiceProvider.GetRequiredService<IOptions<ChatOptions>>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
                var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

                var user = await identityService.GetCurrentUser();

                if (user is null) return TypedResults.Unauthorized();

                if (image is null)
                {
                    return TypedResults.BadRequest("Missing data");
                }

                try
                {
                    // Save Image
                    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Pics");

                    if (!Directory.Exists(uploadsPath))
                    {
                        Directory.CreateDirectory(uploadsPath);
                    }

                    var fileName = user.Id + Path.GetExtension(image.FileName);
                    var filePath = Path.Combine(uploadsPath, fileName);

                    await using var stream = new FileStream(filePath, FileMode.Create);
                    await image.CopyToAsync(stream);

                    user.Image = fileName;

                    await userManager.UpdateAsync(user);

                    return TypedResults.Ok(options.Value.PicAvatarUrl?.Replace("[0]", user.Id));
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return TypedResults.BadRequest("Something went wrong when trying to change your avatar");
                }
            }).DisableAntiforgery();

        routeGroup.MapGet("/users/avatar/{userId:minlength(1)}/pic",
            async Task<Results<PhysicalFileHttpResult, BadRequest<string>, UnauthorizedHttpResult>> (
                [FromServices] IServiceProvider sp, string userId, IWebHostEnvironment environment) =>
            {
                using var scope = sp.CreateScope();
                var userMgr = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

                if (userId is null) return TypedResults.Unauthorized();

                var user = await userMgr.FindByIdAsync(userId);

                if (user == null) return TypedResults.BadRequest("Can't find user for this user id");

                if (user.Image is null)
                {
                    return TypedResults.BadRequest("Can't find image related to this user");
                }

                var path = GetFullPath(environment.ContentRootPath, user.Image);

                var imageFileExtension = Path.GetExtension(user.Image);
                if (imageFileExtension != null)
                {
                    var mimetype = GetImageMimeTypeFromImageFileExtension(imageFileExtension);
                    var lastModified = File.GetLastWriteTimeUtc(path);

                    return TypedResults.PhysicalFile(path, mimetype, lastModified: lastModified);
                }

                return TypedResults.BadRequest("Something went wrong when getting image file");
            }).AllowAnonymous();

        var accountGroup = routeGroup.MapGroup("/manage").RequireAuthorization();

        accountGroup.MapGet("/info", async Task<Results<Ok<UserResponse>, ValidationProblem, NotFound>>
            (ClaimsPrincipal claimsPrincipal, [FromServices] IServiceProvider sp) =>
        {
            var options = sp.GetRequiredService<IOptions<ChatOptions>>();

            var userManager = sp.GetRequiredService<UserManager<TUser>>();
            if (await userManager.GetUserAsync(claimsPrincipal) is not { } user)
            {
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(await CreateInfoResponseAsync(options, user, userManager));
        });

        accountGroup.MapPost("/info", async Task<Results<Ok<UserResponse>, ValidationProblem, NotFound>>
        (ClaimsPrincipal claimsPrincipal, [FromBody] InfoRequest infoRequest, HttpContext context,
            [FromServices] IServiceProvider sp) =>
        {
            var userManager = sp.GetRequiredService<UserManager<TUser>>();
            var options = sp.GetRequiredService<IOptions<ChatOptions>>();

            if (await userManager.GetUserAsync(claimsPrincipal) is not { } user)
            {
                return TypedResults.NotFound();
            }

            if (!string.IsNullOrEmpty(infoRequest.NewEmail) && !_emailAddressAttribute.IsValid(infoRequest.NewEmail))
            {
                return CreateValidationProblem(
                    IdentityResult.Failed(userManager.ErrorDescriber.InvalidEmail(infoRequest.NewEmail)));
            }

            if (!string.IsNullOrEmpty(infoRequest.NewPassword))
            {
                if (string.IsNullOrEmpty(infoRequest.OldPassword))
                {
                    return CreateValidationProblem("OldPasswordRequired",
                        "The old password is required to set a new password. If the old password is forgotten, use /resetPassword.");
                }

                var changePasswordResult =
                    await userManager.ChangePasswordAsync(user, infoRequest.OldPassword, infoRequest.NewPassword);
                if (!changePasswordResult.Succeeded)
                {
                    return CreateValidationProblem(changePasswordResult);
                }
            }

            if (!string.IsNullOrEmpty(infoRequest.NewEmail))
            {
                var email = await userManager.GetEmailAsync(user);

                if (email != infoRequest.NewEmail)
                {
                    await userManager.SetUserNameAsync(user, infoRequest.NewEmail);
                    await userManager.SetEmailAsync(user, infoRequest.NewEmail);
                }
            }

            return TypedResults.Ok(await CreateInfoResponseAsync(options, user, userManager));
        });

        return new IdentityEndpointsConventionBuilder(routeGroup);
    }

    private static ValidationProblem CreateValidationProblem(string errorCode, string errorDescription) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            { errorCode, [errorDescription] }
        });

    private static ValidationProblem CreateValidationProblem(IdentityResult result)
    {
        // We expect a single error code and description in the normal case.
        // This could be golfed with GroupBy and ToDictionary, but perf! :P
        Debug.Assert(!result.Succeeded);
        var errorDictionary = new Dictionary<string, string[]>(1);

        foreach (var error in result.Errors)
        {
            string[] newDescriptions;

            if (errorDictionary.TryGetValue(error.Code, out var descriptions))
            {
                newDescriptions = new string[descriptions.Length + 1];
                Array.Copy(descriptions, newDescriptions, descriptions.Length);
                newDescriptions[descriptions.Length] = error.Description;
            }
            else
            {
                newDescriptions = [error.Description];
            }

            errorDictionary[error.Code] = newDescriptions;
        }

        return TypedResults.ValidationProblem(errorDictionary);
    }

    private static async Task<UserResponse> CreateInfoResponseAsync<TUser>(IOptions<ChatOptions> options,
        TUser user, UserManager<TUser> userManager)
        where TUser : User
    {
        return new UserResponse(await userManager.GetUserIdAsync(user),
            await userManager.GetUserNameAsync(user),
            options.Value.PicAvatarUrl?.Replace("[0]", user.Id),
            await userManager.GetEmailAsync(user) ?? throw new NotSupportedException("Users must have an email."));
    }

    // Wrap RouteGroupBuilder with a non-public type to avoid a potential future behavioral breaking change.
    private sealed class IdentityEndpointsConventionBuilder(RouteGroupBuilder inner) : IEndpointConventionBuilder
    {
        private IEndpointConventionBuilder InnerAsConventionBuilder => inner;

        public void Add(Action<EndpointBuilder> convention) => InnerAsConventionBuilder.Add(convention);

        public void Finally(Action<EndpointBuilder> finallyConvention) =>
            InnerAsConventionBuilder.Finally(finallyConvention);
    }

    [AttributeUsage(AttributeTargets.Parameter)]
    private sealed class FromBodyAttribute : Attribute, IFromBodyMetadata
    {
    }

    [AttributeUsage(AttributeTargets.Parameter)]
    private sealed class FromServicesAttribute : Attribute, IFromServiceMetadata
    {
    }

    [AttributeUsage(AttributeTargets.Parameter)]
    private sealed class FromQueryAttribute : Attribute, IFromQueryMetadata
    {
        public string? Name => null;
    }

    private static string GetImageMimeTypeFromImageFileExtension(string extension) => extension switch
    {
        ".png" => "image/png",
        ".gif" => "image/gif",
        ".jpg" or ".JPG" or ".jpeg" => "image/jpeg",
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