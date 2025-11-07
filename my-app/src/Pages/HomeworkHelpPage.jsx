// HomeworkHelpPage - AI-powered homework assistant using Gemini API
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import '../Styles/Pages.css';

export default function HomeworkHelpPage() {
  // Initialize with welcome message
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hi! I'm your homework helper. Ask me anything about your studies, and I'll do my best to help you understand the concepts! 📚"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Ref for auto-scrolling to bottom of chat
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle form submission and API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      // Create prompt with conversation context
      const fullPrompt = `You are a helpful homework assistant. Explain concepts clearly, guide step by step, and encourage the student.

Previous conversation:
${conversationHistory}

User: ${userMessage.content}

Please respond:`;

      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('No API key found. Set VITE_GEMINI_API_KEY in your .env file');

      // ✅ Correct Gemini API call using generateContent endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              maxOutputTokens: 500
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`API Error: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('AI Response:', data);

      // Extract AI response text from nested structure
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response from AI.';

      // Add AI response to messages
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: aiText }]);
    } catch (err) {
      console.error(err);
      // Show error message to user
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Clear chat and reset to welcome message
  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: "Hi! I'm your homework helper. Ask me anything about your studies, and I'll do my best to help you understand the concepts! 📚"
      }
    ]);
  };

  return (
    <div className="homework-page">
      <div className="homework-hero">
        <div className="homework-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <circle cx="10" cy="8" r="2" />
            <path d="M14 8h4M14 12h4M14 16h4" />
          </svg>
        </div>
        <h1 className="homework-title">Homework Helper</h1>
        <p className="homework-subtitle">Ask questions and get help with your studies</p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <span>Chat</span>
          <button className="clear-chat-btn" onClick={clearChat} title="Clear chat">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-container" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            placeholder="Ask about your homework..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" className="chat-send-btn" disabled={!input.trim() || isTyping}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
