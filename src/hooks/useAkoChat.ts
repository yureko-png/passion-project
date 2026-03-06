import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type KnowledgeMode = 'chat' | 'study' | 'quick' | 'stepbystep' | 'research';

interface ChatContext {
  timerState?: 'working' | 'break' | 'idle';
  timeRemaining?: string;
  currentTask?: string;
  completedTasks?: number;
  focusLevel?: number;
  level?: number;
  streak?: number;
  focusMinutes?: number;
  achievement?: string;
  levelUp?: number;
  questProgress?: { current: number; target: number; title: string };
  knowledgeMode?: KnowledgeMode;
  searchQuery?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ako-chat`;

export const useAkoChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeMode, setKnowledgeMode] = useState<KnowledgeMode>('chat');

  const sendMessage = useCallback(async (
    userMessage: string, 
    context?: ChatContext,
  ) => {
    if (!userMessage.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: { ...context, knowledgeMode },
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsg: Message = { role: 'assistant', content: data.message };
      setMessages(prev => [...prev, assistantMsg]);

      return data.message;
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = { 
        role: 'assistant', 
        content: 'Mou~ Something went wrong, Sensei... Please try again!' 
      };
      setMessages(prev => [...prev, errorMsg]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, knowledgeMode]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    knowledgeMode,
    setKnowledgeMode,
    sendMessage,
    clearMessages,
  };
};
