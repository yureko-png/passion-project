import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, material, questionType, count, difficulty, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const subjectMap: Record<string, string> = {
      math: "Matematika (aritmatika, aljabar, geometri, statistik)",
      science: "IPA / Sains (fisika, kimia, biologi)",
      english: "Bahasa Inggris (grammar, vocabulary, reading comprehension)",
    };

    const subjectDesc = subjectMap[subject] || subject;
    const qCount = count || 5;
    const diff = difficulty || "medium";
    const lang = language || "id";
    const qType = questionType || "multiple_choice";

    const diffMap: Record<string, string> = {
      easy: "mudah, untuk tingkat SMP",
      medium: "sedang, untuk tingkat SMA",
      hard: "sulit, untuk tingkat universitas/olimpiade",
    };

    let prompt = `Generate exactly ${qCount} ${qType === 'essay' ? 'essay' : qType === 'mixed' ? 'mixed (some multiple choice, some essay)' : 'multiple choice'} questions for: ${subjectDesc}.
Difficulty: ${diffMap[diff] || diffMap.medium}.
Language: ${lang === 'en' ? 'English' : 'Bahasa Indonesia'}.`;

    if (material) {
      prompt += `\n\nBase the questions on this study material:\n${material}`;
    }

    const questionSchema: any = {
      type: "object",
      properties: {
        question: { type: "string" },
        type: { type: "string", enum: ["multiple_choice", "essay"] },
        options: { type: "array", items: { type: "string" } },
        correct: { type: "number", description: "0-based index for MC, -1 for essay" },
        correctAnswer: { type: "string", description: "Model answer for essay questions" },
        explanation: { type: "string" },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
      },
      required: ["question", "type", "options", "correct", "explanation", "difficulty"],
      additionalProperties: false,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a quiz generator for students. Generate quiz questions. For multiple choice: provide 4 options with exactly one correct answer (0-based index). For essay: set options to empty array and correct to -1, provide a model correctAnswer. Always include explanation.`,
          },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_quiz",
            description: "Return the generated quiz questions",
            parameters: {
              type: "object",
              properties: {
                questions: { type: "array", items: questionSchema },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_quiz" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let questions = [];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      questions = parsed.questions || [];
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-quiz error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
