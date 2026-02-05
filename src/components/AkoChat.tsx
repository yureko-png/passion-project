 import { useState, useRef, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { MessageCircle, Send, X, Volume2, VolumeX, Loader2, Trash2 } from 'lucide-react';
 import { useAkoChat } from '@/hooks/useAkoChat';
 import Mascot from './Mascot';
 import type { MascotMood } from './Mascot';
 
 interface AkoChatProps {
   timerState?: 'working' | 'break' | 'idle';
   timeRemaining?: string;
   currentTask?: string;
   completedTasks?: number;
 }
 
 const getMoodFromMessage = (message: string): MascotMood => {
   const lowerMessage = message.toLowerCase();
   
   if (lowerMessage.includes('great') || lowerMessage.includes('excellent') || 
       lowerMessage.includes('amazing') || lowerMessage.includes('proud') ||
       lowerMessage.includes('wonderful') || lowerMessage.includes('congratulations')) {
     return 'encouraging';
   }
   if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate') ||
       lowerMessage.includes('work') || lowerMessage.includes('important')) {
     return 'firm';
   }
   if (lowerMessage.includes('think') || lowerMessage.includes('hmm') ||
       lowerMessage.includes('consider') || lowerMessage.includes('maybe')) {
     return 'thinking';
   }
   if (lowerMessage.includes('!') || lowerMessage.includes('ara') ||
       lowerMessage.includes('oh') || lowerMessage.includes('really')) {
     return 'surprised';
   }
   if (lowerMessage.includes('break') || lowerMessage.includes('relax') ||
       lowerMessage.includes('rest') || lowerMessage.includes('casual')) {
     return 'casual';
   }
   return 'neutral';
 };
 
 const AkoChat = ({ timerState, timeRemaining, currentTask, completedTasks }: AkoChatProps) => {
   const [isOpen, setIsOpen] = useState(false);
   const [input, setInput] = useState('');
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   
   const {
     messages,
     isLoading,
     isPlayingVoice,
     voiceEnabled,
     sendMessage,
     stopVoice,
     clearMessages,
     toggleVoice,
   } = useAkoChat();
 
   // Auto-scroll to latest message
   useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);
 
   // Focus input when chat opens
   useEffect(() => {
     if (isOpen) {
       inputRef.current?.focus();
     }
   }, [isOpen]);
 
   const handleSend = async () => {
     if (!input.trim() || isLoading) return;
     
     const message = input;
     setInput('');
     
     await sendMessage(message, {
       timerState,
       timeRemaining,
       currentTask,
       completedTasks,
     });
   };
 
   const handleKeyPress = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       handleSend();
     }
   };
 
   const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
   const currentMood = lastAssistantMessage 
     ? getMoodFromMessage(lastAssistantMessage.content) 
     : 'neutral';
 
   return (
     <>
       {/* Chat Toggle Button */}
       <motion.button
         onClick={() => setIsOpen(!isOpen)}
         className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
         whileHover={{ scale: 1.05 }}
         whileTap={{ scale: 0.95 }}
       >
         {isOpen ? (
           <X className="w-6 h-6" />
         ) : (
           <MessageCircle className="w-6 h-6" />
         )}
       </motion.button>
 
       {/* Chat Panel */}
       <AnimatePresence>
         {isOpen && (
           <motion.div
             initial={{ opacity: 0, y: 20, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 20, scale: 0.95 }}
             transition={{ duration: 0.2 }}
             className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
           >
             {/* Header */}
             <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                   <span className="text-lg">🎀</span>
                 </div>
                 <div>
                   <h3 className="font-semibold text-foreground">Ako</h3>
                   <p className="text-xs text-muted-foreground">
                     {isPlayingVoice ? 'Speaking...' : 'Your Productivity Coach'}
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button
                   onClick={toggleVoice}
                   className={`p-2 rounded-full transition-colors ${
                     voiceEnabled 
                       ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                       : 'bg-muted text-muted-foreground hover:bg-muted/80'
                   }`}
                   title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
                 >
                   {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                 </button>
                 <button
                   onClick={clearMessages}
                   className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                   title="Clear chat"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             </div>
 
             {/* Mascot Preview */}
             <div className="p-4 bg-gradient-to-b from-primary/5 to-transparent flex justify-center">
               <Mascot 
                 message={lastAssistantMessage?.content || "Hai, Sensei~! How can I help you today?"}
                 mood={currentMood}
                 size="small"
                 isTyping={isLoading}
               />
             </div>
 
             {/* Messages */}
             <div className="h-64 overflow-y-auto p-4 space-y-3 scrollbar-thin">
               {messages.length === 0 && (
                 <div className="text-center text-muted-foreground text-sm py-8">
                   <p>Start chatting with Ako!</p>
                   <p className="text-xs mt-1">Ask about productivity tips, motivation, or just say hi~</p>
                 </div>
               )}
               
               {messages.map((msg, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                   <div
                     className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                       msg.role === 'user'
                         ? 'bg-primary text-primary-foreground rounded-br-md'
                         : 'bg-muted text-foreground rounded-bl-md'
                     }`}
                   >
                     <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                   </div>
                 </motion.div>
               ))}
               
               {isLoading && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex justify-start"
                 >
                   <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                     <div className="flex items-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin text-primary" />
                       <span className="text-sm text-muted-foreground">Ako is thinking...</span>
                     </div>
                   </div>
                 </motion.div>
               )}
               
               <div ref={messagesEndRef} />
             </div>
 
             {/* Input */}
             <div className="p-4 border-t border-border bg-background/50">
               <div className="flex items-center gap-2">
                 <input
                   ref={inputRef}
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyPress={handleKeyPress}
                   placeholder="Type a message..."
                   className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                   disabled={isLoading}
                 />
                 <motion.button
                   onClick={handleSend}
                   disabled={!input.trim() || isLoading}
                   className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <Send className="w-4 h-4" />
                 </motion.button>
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </>
   );
 };
 
 export default AkoChat;