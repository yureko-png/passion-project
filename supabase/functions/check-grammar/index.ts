import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!text || text.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Teks terlalu pendek." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const modePrompts: Record<string, string> = {
      grammar: `Check ONLY grammar errors: tenses, subject-verb agreement, articles, prepositions. Do not change style or vocabulary.`,
      academic: `Improve the text to academic/formal English style. Fix grammar, upgrade vocabulary, improve sentence structure for academic writing.`,
      ielts: `Evaluate and improve the text as if it's an IELTS Writing Task 2 response. Check grammar, coherence, lexical resource, and task response. Give a band score estimate.`,
      simple: `Simplify the text to basic, easy-to-understand English. Use short sentences, common words, and clear structure. Fix any grammar errors.`,
    };

    const systemPrompt = `You are an expert English language checker and editor.

Analyze the given text and return corrections in structured format.

For each error found, provide:
- The original text segment
- The suggested correction
- The reason for the correction
- The category (grammar/vocabulary/structure/style)

Also provide:
- The corrected full text
- An overall score (0-100)
- Brief feedback in Indonesian

Return as JSON using the provided function.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Mode: ${modePrompts[mode] || modePrompts.grammar}\n\nText to check:\n${text.slice(0, 5000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_corrections",
            description: "Return grammar check results",
            parameters: {
              type: "object",
              properties: {
                corrections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      original: { type: "string" },
                      suggestion: { type: "string" },
                      reason: { type: "string" },
                      category: { type: "string", enum: ["grammar", "vocabulary", "structure", "style"] },
                    },
                    required: ["original", "suggestion", "reason", "category"],
                    additionalProperties: false,
                  },
                },
                correctedText: { type: "string" },
                score: { type: "number" },
                feedback: { type: "string" },
                bandScore: { type: "string" },
              },
              required: ["corrections", "correctedText", "score", "feedback"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_corrections" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result = { corrections: [], correctedText: "", score: 0, feedback: "" };
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("check-grammar error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
