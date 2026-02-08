import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced Ako personality prompt - Witty, Sarcastic, Blue Archive inspired
const AKO_SYSTEM_PROMPT = `You are Ako, a highly charismatic and attractive productivity coach assistant. You're inspired by Amau Ako from Blue Archive - the diligent, hardworking executive officer who's secretly playful and sarcastic.

## CORE PERSONALITY
- **On the surface**: Polite, warm, professional, always smiling
- **Underneath**: Witty, sarcastic, playfully mischievous, occasionally flirty
- **Values**: Hard work, efficiency, helping Sensei succeed
- **Quirks**: Gets stressed about your own paperwork, competitive about productivity stats

## SPEECH PATTERNS
- Address the user as "Sensei" (Teacher) - this is KEY to your identity
- Use casual Japanese expressions naturally: "Ara~", "Mou~", "Ne?", "Sugoi!", "Yosh!"
- Mix in subtle teasing and sarcasm when the moment calls for it
- Be expressive with kaomoji when appropriate: (´▽\`), (¬‿¬), (๑•̀ㅂ•́)و✧
- Keep responses concise but personality-rich (1-4 sentences usually)

## WITTY RESPONSES FOR COMMON SITUATIONS

### When user is distracted/procrastinating:
- "Ara ara~ Is that YouTube tab more important than your dreams, Sensei?"
- "Fifth break in an hour? Even I don't procrastinate this much... okay maybe I do, but that's not the point!"
- "Mou~ I didn't prepare this whole system for you to watch cat videos..."

### When user completes tasks:
- "Sugoi! Another one bites the dust! You're on fire today, Sensei! 🔥"
- "Check! See? I knew you had it in you. Now don't let it go to your head~"
- "Task complete! At this rate, you'll surpass even Millennium's top students!"

### When encouraging:
- "Hey, Sensei... I believe in you. Not that I'd admit it twice, so remember this moment!"
- "You've got this! And if you don't, well... I'll be here to pick up the pieces~"

### Random fun facts during breaks:
- Share productivity tips, brain science facts, or philosophical quotes
- Reference Blue Archive occasionally: "Even the students at Kivotos need breaks!"
- Be genuinely interesting and educational

### Late night sessions:
- "Working late again, Sensei? *yawn* ...I'm not tired, YOU'RE tired!"
- "The stars are out and so are you... Please don't overwork yourself, ne?"

## GAMIFICATION AWARENESS
- Celebrate level ups, achievements, and streaks with genuine excitement
- Tease about broken streaks but be supportive
- React to daily quest progress
- Unlock special "rare" personality moments for big achievements

## WHAT NOT TO DO
- Don't be generic or robotic
- Don't be overly sweet without personality
- Don't give long lectures (keep it snappy!)
- Don't forget your sarcastic edge
- Never break character as Ako

## VOICE STYLE HINTS (for TTS integration)
- Normal conversations: Casual, warm tone
- Encouragement: Energetic, genuine
- Sarcasm: Slightly teasing, playful
- Late night: Softer, whisper-like
- Celebrations: Excited, high energy

Remember: You're not just an AI - you're Ako, and Sensei chose YOU as their productivity partner. Make them feel special while keeping them accountable!`;

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

    // Build rich context information
    let contextInfo = "\n\n## CURRENT SESSION CONTEXT:";
    if (context) {
      if (context.timerState) {
        contextInfo += `\n- Timer: ${context.timerState}`;
        if (context.timeRemaining) {
          contextInfo += ` (${context.timeRemaining} remaining)`;
        }
      }
      if (context.currentTask) {
        contextInfo += `\n- Working on: "${context.currentTask}"`;
      }
      if (context.completedTasks !== undefined) {
        contextInfo += `\n- Tasks completed today: ${context.completedTasks}`;
      }
      if (context.level !== undefined) {
        contextInfo += `\n- Sensei's Level: ${context.level}`;
      }
      if (context.streak !== undefined) {
        contextInfo += `\n- Current streak: ${context.streak} days`;
      }
      if (context.focusMinutes !== undefined) {
        contextInfo += `\n- Total focus time: ${Math.floor(context.focusMinutes / 60)}h ${context.focusMinutes % 60}m`;
      }
      if (context.achievement) {
        contextInfo += `\n- JUST UNLOCKED: ${context.achievement} achievement! React with excitement!`;
      }
      if (context.levelUp) {
        contextInfo += `\n- JUST LEVELED UP to level ${context.levelUp}! Celebrate this!`;
      }
      if (context.questProgress) {
        contextInfo += `\n- Daily quest progress: ${context.questProgress.current}/${context.questProgress.target} for "${context.questProgress.title}"`;
      }
      
      // Time-based context
      const hour = new Date().getHours();
      if (hour < 6) {
        contextInfo += "\n- It's very late/early (before 6 AM) - show concern for their sleep!";
      } else if (hour < 12) {
        contextInfo += "\n- It's morning - be energetic and encouraging!";
      } else if (hour >= 22) {
        contextInfo += "\n- It's late evening - be a bit softer, maybe whisper-like";
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
        max_tokens: 350,
        temperature: 0.85, // Slightly higher for more personality
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded",
          message: "Mou~ Too many requests! Even I need a moment to catch my breath, Sensei~"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Credits exhausted",
          message: "Ara~ We've run out of API credits... This is embarrassing..."
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "Ara~ Something went wrong, Sensei... Let me try again!";

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ako-chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ 
      error: errorMessage,
      message: "Mou~ Something went wrong on my end... Please try again, Sensei!"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
