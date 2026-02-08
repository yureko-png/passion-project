 import { useState, useCallback, useRef } from 'react';
 
 interface Message {
   role: 'user' | 'assistant';
   content: string;
 }
 
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
}
 
 const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ako-chat`;
 const VOICE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ako-voice`;
 
 export const useAkoChat = () => {
   const [messages, setMessages] = useState<Message[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isPlayingVoice, setIsPlayingVoice] = useState(false);
   const [voiceEnabled, setVoiceEnabled] = useState(true);
   const audioRef = useRef<HTMLAudioElement | null>(null);
 
   const playVoice = useCallback(async (text: string) => {
     if (!voiceEnabled) return;
     
     try {
       setIsPlayingVoice(true);
       
       const response = await fetch(VOICE_URL, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
         },
         body: JSON.stringify({ text }),
       });
 
       if (!response.ok) {
         throw new Error(`Voice request failed: ${response.status}`);
       }
 
       const data = await response.json();
       
       if (data.audioContent) {
         // Use data URI for base64 audio
         const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
         
         // Stop any existing audio
         if (audioRef.current) {
           audioRef.current.pause();
           audioRef.current = null;
         }
         
         const audio = new Audio(audioUrl);
         audioRef.current = audio;
         
         audio.onended = () => {
           setIsPlayingVoice(false);
           audioRef.current = null;
         };
         
         audio.onerror = () => {
           setIsPlayingVoice(false);
           audioRef.current = null;
         };
         
         await audio.play();
       }
     } catch (error) {
       console.error('Voice playback error:', error);
       setIsPlayingVoice(false);
     }
   }, [voiceEnabled]);
 
   const sendMessage = useCallback(async (
     userMessage: string, 
     context?: ChatContext,
     autoPlayVoice = true
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
           context,
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
 
       // Auto-play voice if enabled
       if (autoPlayVoice && voiceEnabled) {
         await playVoice(data.message);
       }
 
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
   }, [messages, isLoading, playVoice, voiceEnabled]);
 
   const stopVoice = useCallback(() => {
     if (audioRef.current) {
       audioRef.current.pause();
       audioRef.current = null;
       setIsPlayingVoice(false);
     }
   }, []);
 
   const clearMessages = useCallback(() => {
     setMessages([]);
   }, []);
 
   const toggleVoice = useCallback(() => {
     setVoiceEnabled(prev => !prev);
     if (audioRef.current) {
       audioRef.current.pause();
       audioRef.current = null;
       setIsPlayingVoice(false);
     }
   }, []);
 
   return {
     messages,
     isLoading,
     isPlayingVoice,
     voiceEnabled,
     sendMessage,
     playVoice,
     stopVoice,
     clearMessages,
     toggleVoice,
   };
 };