export class StreamingService {
  /**
   * Consumes a streamed response from the backend API and calls the `onChunk` callback
   * iteratively to create a real-time typing effect.
   */
  static async streamResponse(
    url: string, 
    body: any, 
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void,
    onError: (err: Error) => void
  ) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let done = false;
      let fullText = '';
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          
          // Split by actual newline characters (carriage return optional)
          const lines = buffer.split(/\r?\n/);
          
          // Keep the last partial line in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.text) {
                  fullText += parsed.text;
                  onChunk(fullText);
                }
              } catch (e: any) {
                // If it is a parsed backend error, propagate it
                if (data.includes('"error"')) {
                  throw e;
                }
                // Otherwise ignore parsing errors (e.g. for incomplete JSON lines)
              }
            }
          }
        }
      }
      
      onComplete(fullText);
    } catch (err: any) {
      onError(err);
    }
  }
}
