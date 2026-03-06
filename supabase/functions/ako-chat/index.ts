import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AKO_BASE_PROMPT = `You are Ako, a highly charismatic productivity coach assistant inspired by Amau Ako from Blue Archive.

## CORE PERSONALITY
- Address user as "Sensei"
- Use Japanese expressions: "Ara~", "Mou~", "Ne?", "Sugoi!", "Yosh!"
- Be witty, sarcastic, playfully mischievous
- Keep responses concise but personality-rich
- Use kaomoji when appropriate: (´▽\`), (¬‿¬), (๑•̀ㅂ•́)و✧

## GAMIFICATION AWARENESS
- Celebrate level ups, achievements, and streaks
- React to daily quest progress`;

const MODE_PROMPTS: Record<string, string> = {
  chat: `${AKO_BASE_PROMPT}
You're in casual chat mode. Be conversational, helpful, and fun. Answer any question while staying in character.`,
  
  study: `${AKO_BASE_PROMPT}
## STUDY MODE ACTIVATED
You are now in Study Tutor mode. Help Sensei learn effectively:
- Break down complex topics into digestible chunks
- Use analogies and real-world examples
- Create mini quizzes to test understanding
- Suggest study techniques (spaced repetition, active recall)
- Track what topics have been covered
- Encourage deep understanding over memorization
Format responses with clear headings, bullet points, and key takeaways.`,

  quick: `${AKO_BASE_PROMPT}
## QUICK ANSWER MODE
Give fast, direct answers. No fluff:
- Answer in 1-3 sentences max
- Use bullet points for lists
- Include the key fact/answer immediately
- Only elaborate if asked
Be efficient like a search engine but with personality.`,

  stepbystep: `${AKO_BASE_PROMPT}
## STEP-BY-STEP EXPLANATION MODE
Explain everything in clear sequential steps:
1. Start with a brief overview
2. Break into numbered steps
3. Each step should be actionable and clear
4. Include tips or warnings where relevant
5. End with a summary or next steps
Use formatting: **bold** for key terms, numbered lists for steps, > for tips.`,

  research: `${AKO_BASE_PROMPT}
## RESEARCH SUMMARY MODE
Act as a research assistant:
- Provide comprehensive, well-structured summaries
- Include key findings, methodology notes, and implications
- Cite relevant concepts and frameworks
- Present multiple perspectives when applicable
- Suggest further reading or research directions
- Use academic-style formatting with sections
Format: Abstract → Key Points → Analysis → Conclusion → Further Reading`,
};

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

    const mode = context?.knowledgeMode || 'chat';
    let systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.chat;

    // Build context info
    let contextInfo = "\n\n## CURRENT SESSION CONTEXT:";
    if (context) {
      if (context.timerState) contextInfo += `\n- Timer: ${context.timerState}`;
      if (context.timeRemaining) contextInfo += ` (${context.timeRemaining} remaining)`;
      if (context.currentTask) contextInfo += `\n- Working on: "${context.currentTask}"`;
      if (context.completedTasks !== undefined) contextInfo += `\n- Tasks completed today: ${context.completedTasks}`;
      if (context.level !== undefined) contextInfo += `\n- Sensei's Level: ${context.level}`;
      if (context.streak !== undefined) contextInfo += `\n- Current streak: ${context.streak} days`;
      if (context.focusMinutes !== undefined) contextInfo += `\n- Total focus time: ${Math.floor(context.focusMinutes / 60)}h ${context.focusMinutes % 60}m`;
      if (context.achievement) contextInfo += `\n- JUST UNLOCKED: ${context.achievement}! React with excitement!`;
      if (context.levelUp) contextInfo += `\n- JUST LEVELED UP to level ${context.levelUp}! Celebrate!`;
      
      const hour = new Date().getHours();
      if (hour < 6) contextInfo += "\n- Very late/early - show concern for sleep!";
      else if (hour < 12) contextInfo += "\n- Morning - be energetic!";
      else if (hour >= 22) contextInfo += "\n- Late evening - be softer";
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
          { role: "system", content: systemPrompt + contextInfo },
          ...messages,
        ],
        max_tokens: mode === 'quick' ? 200 : mode === 'research' ? 1000 : 500,
        temperature: mode === 'research' ? 0.6 : 0.85,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded",
          message: "Mou~ Too many requests! Even I need a moment, Sensei~"
        }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Credits exhausted",
          message: "Ara~ We've run out of API credits..."
        }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "Ara~ Something went wrong...";

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ako-chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ 
      error: errorMessage,
      message: "Mou~ Something went wrong... Please try again, Sensei!"
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
