import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        text: "Hare Krishna! How are you feeling today? Tell me what's on your mind.",
        isBot: true,
      },
    ]);
  }, []);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/suggest', {
        text: input,
        language: 'english',
      });

      const { chapter, verse, sanskrit, translation, spiritual_theme } = response.data;

      const botResponseText = `
        For the theme of <strong>${spiritual_theme.replace(/_/g, ' ')}</strong>, here is a shloka from Chapter ${chapter}, Verse ${verse}:
        <br/><br/>
        <strong>Sanskrit:</strong><br/><em>${sanskrit}</em>
        <br/><br/>
        <strong>English Translation:</strong><br/>${translation}
      `;

      const botMessage = { text: botResponseText, isBot: true };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Error fetching shloka:", error);
      const errorMessage = { text: "I'm sorry, I couldn't connect to the wisdom of the Gita right now. Please try again later.", isBot: true };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="chat-window">
        <div className="chat-header">
          <h1>Bhagavad Gita AI</h1>
          <p>Your spiritual companion</p>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
              <p dangerouslySetInnerHTML={{ __html: msg.text }}></p>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me how you feel..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default App;
