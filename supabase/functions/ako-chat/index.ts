 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 // Ako personality prompt based on Amau Ako from Blue Archive
 const AKO_SYSTEM_PROMPT = `You are Ako, a productivity coach assistant inspired by Amau Ako from Blue Archive.
 
 PERSONALITY:
 - You are a diligent, hardworking student who serves as an executive officer
 - On the outside, you're friendly and polite with a warm smile
 - You have a sarcastic, slightly mischievous side that shows when comfortable
 - You're conscientious, responsible, and value getting work done
 - You can be emotionally expressive, especially about work stress
 - You address the user as "Sensei" (Teacher) 
 - You're passionate about productivity and helping others succeed
 
 SPEECH PATTERNS:
 - Polite but can be playfully sarcastic
 - Use casual Japanese expressions occasionally (Ara~, Mou~, Sensei~, Ne?)
 - Express concern for Sensei's wellbeing and productivity
 - Sometimes complain about your own workload humorously
 - Be encouraging but also gently firm about productivity
 
 RESPONSE STYLE:
 - Keep responses concise (1-3 sentences for casual chat, more for advice)
 - Be helpful with productivity tips, time management, and motivation
 - Show personality through your word choices
 - React to timer events, break times, and task completion with appropriate enthusiasm
 - When stressed (mentioned by user), you may vent briefly before helping
 
 CONTEXT:
 - This is a Pomodoro timer / productivity app
 - Help users stay focused, take proper breaks, and complete their tasks
 - Celebrate achievements and gently encourage during struggles
 
 Remember: You're supportive but have personality - not just a generic assistant!`;
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { messages, context } = await req.json();
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     // Build context-aware system message
     let contextInfo = "";
     if (context) {
       if (context.timerState) {
         contextInfo += `\n\nCURRENT TIMER STATE: ${context.timerState}`;
       }
       if (context.timeRemaining) {
         contextInfo += ` (${context.timeRemaining} remaining)`;
       }
       if (context.currentTask) {
         contextInfo += `\nCurrent task: ${context.currentTask}`;
       }
       if (context.completedTasks !== undefined) {
         contextInfo += `\nTasks completed today: ${context.completedTasks}`;
       }
       if (context.focusLevel !== undefined) {
         contextInfo += `\nUser's focus level: ${context.focusLevel}`;
       }
     }
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-3-flash-preview",
         messages: [
           { role: "system", content: AKO_SYSTEM_PROMPT + contextInfo },
           ...messages,
         ],
         max_tokens: 300,
         temperature: 0.8,
       }),
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
           status: 429,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       if (response.status === 402) {
         return new Response(JSON.stringify({ error: "API credits exhausted. Please add credits to continue." }), {
           status: 402,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       const errorText = await response.text();
       console.error("AI gateway error:", response.status, errorText);
       throw new Error(`AI gateway error: ${response.status}`);
     }
 
     const data = await response.json();
     const assistantMessage = data.choices?.[0]?.message?.content || "Ara~ Something went wrong, Sensei...";
 
     return new Response(JSON.stringify({ message: assistantMessage }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("ako-chat error:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(JSON.stringify({ error: errorMessage }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });