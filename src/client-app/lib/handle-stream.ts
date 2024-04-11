const axios = require('axios');

async function handleStream() {
  const response = await axios.get(
    `${
      process.env.API_SERVER_URL || 'https://api.chatapp.com'
    }/api/v1/chat/messages/ai/stream?input=hello`,
    {
      responseType: 'stream',
    }
  );

  const stream = response.data;

  for await (const chunk of stream) {
    console.log(chunk.toString());
  }
}

handleStream();
