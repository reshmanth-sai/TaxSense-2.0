import { ChatMessageItem } from '../../store/useTaxStore';

export class ConversationMemory {
  /**
   * Formats the local chat history into the structure expected by the Gemini API
   */
  static formatForAPI(history: ChatMessageItem[]): Array<{ role: string; content: string }> {
    // Filter out the initial welcome message or any leading assistant messages
    // to ensure the conversation history sent to Gemini starts with a user turn.
    let startIndex = 0;
    while (startIndex < history.length && history[startIndex].role === 'assistant') {
      startIndex++;
    }

    return history.slice(startIndex).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
  }

  /**
   * Extracts context from recent messages to prevent the AI from repeating itself
   */
  static extractRecentTopics(history: ChatMessageItem[], limit: number = 4): string[] {
    const recent = history.slice(-limit);
    // Basic topic extraction (could be expanded with NLP if needed)
    const topics: string[] = [];
    
    const combinedText = recent.map(r => r.content.toLowerCase()).join(' ');
    
    if (combinedText.includes('nps') || combinedText.includes('80ccd')) topics.push('NPS');
    if (combinedText.includes('80c') || combinedText.includes('elss') || combinedText.includes('ppf')) topics.push('80C Investments');
    if (combinedText.includes('regime') || combinedText.includes('new tax') || combinedText.includes('old tax')) topics.push('Regime Comparison');
    if (combinedText.includes('hra') || combinedText.includes('rent')) topics.push('HRA');
    
    return topics;
  }
}
