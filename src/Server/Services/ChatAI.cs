using OpenAI.Net;
using Message = OpenAI.Net.Message;

namespace Chat.Server.Services;

public sealed class ChatAI : IChatAI
{
    private readonly IOptions<AIOptions> _options;
    private readonly IOpenAIService _openAiService;
    private readonly string _modelName;

    private bool _continue = false;

    private const string SystemPrompt =
        "Transcript of a dialog, where the User interacts with an Assistant. Assistant is helpful, kind, honest, good at writing, and never fails to answer the User's requests immediately and with precision.";

    /// <summary>The web host configuration.</summary>
    private readonly IConfiguration _configuration;

    /// <summary>Logger for use in AI operations.</summary>
    private readonly ILogger _logger;


    public ChatAI(IOptions<AIOptions> options, IConfiguration configuration, ILogger<ChatAI> logger,
        IOpenAIService openAiService)
    {
        var aiOptions = options.Value;
        _configuration = configuration;
        _logger = logger;
        _modelName = aiOptions.OpenAI.ModelName ?? "lmstudio-ai/gemma-2b-it-GGUF/gemma-2b-it-q8_0.gguf";

        if (_configuration.GetSection("AI").Exists())
        {
            _openAiService = openAiService;
        }

        IsEnabled = _openAiService != null;

        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("Embedding model: \"{model}\"", _modelName);
        }
    }

    /// <summary>Gets whether the AI system is enabled.</summary>
    public bool IsEnabled { get; }

    public async Task<string?> Send(SendMessageInput input)
    {
        if (!IsEnabled) return "AI is not enabled";

        List<Message> messages =
        [
            Message.Create(ChatRoleType.System,
                "You are an intelligent assistant. You always provide well-reasoned answers that are both correct and helpful. Always give them an answer."),
            Message.Create(ChatRoleType.User, input.Text)
        ];

        // TODO: Save messages to database in production
        var response = await _openAiService.Chat.Get(messages, o => { o.MaxTokens = 1000; });
        return response.Result?.Choices[0].Message.Content;
    }

    public async IAsyncEnumerable<string?> SendStream(string input)
    {
        if (!IsEnabled) yield return "AI is not enabled";

        if (!_continue)
        {
            _logger.LogInformation(input);
            _continue = true;
        }

        _logger.LogInformation(SystemPrompt);
        List<Message> messages =
        [
            Message.Create(ChatRoleType.System,
                "You are an intelligent assistant. You always provide well-reasoned answers that are both correct and helpful."),
            Message.Create(ChatRoleType.System, "Answer user using English"),
            Message.Create(ChatRoleType.User, input)
        ];

        await foreach (var t in _openAiService.Chat.GetStream(messages, options: options =>
                       {
                           options.PresencePenalty = 1.0f;
                           options.MaxTokens = 1000;
                           options.Temperature = 0.7f;
                       }))
        {
            yield return t?.Result?.Choices[0].Delta?.Content;
        }
    }
}