// client.js
// Fetch the event stream from the server
// Change URL to environment variable for production
fetch('http://localhost:5000/api/v1/chat/messages/ai/stream?input=Hello')
  .then((response) => {
    // Get the readable stream from the response body
    const stream = response.body;
    // Get the reader from the stream
    const reader = stream?.getReader();

    if (reader != null) {
      // Define a function to read each chunk
      const readChunk = () => {
        // Read a chunk from the reader
        reader
          .read()
          .then(({ value, done }) => {
            // Check if the stream is done
            if (done) {
              // Log a message
              console.log('Stream finished');
              // Return from the function
              return;
            }
            // Convert the chunk value to a string
            const chunkString = new TextDecoder().decode(value);
            // Log the chunk string
            console.log(chunkString);
            // Read the next chunk
            readChunk();
          })
          .catch((error) => {
            // Log the error
            console.error(error);
          });
      };
      // Start reading the first chunk
      readChunk();
    }
  })
  .catch((error) => {
    // Log the error
    console.error(error);
  });
