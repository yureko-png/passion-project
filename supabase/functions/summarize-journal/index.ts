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

    if (!text || text.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Teks terlalu pendek. Minimal 50 karakter." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const modePrompts: Record<string, string> = {
      quick: `Buat ringkasan 1 paragraf singkat dari jurnal/artikel ini. Fokus pada temuan utama dan kesimpulan.`,
      study: `Buat catatan belajar (study notes) dari jurnal/artikel ini dalam format:
- **Topik Utama**: ...
- **Poin-poin Penting** (bullet points)
- **Temuan Kunci**: ...
- **Kesimpulan**: ...
- **Istilah Penting**: (daftar istilah + definisi singkat)`,
      deep: `Buat ringkasan mendalam per bagian dari jurnal/artikel ini. Identifikasi dan ringkas setiap section:
1. **Abstract/Abstrak**: ...
2. **Pendahuluan**: ...
3. **Metode**: ...
4. **Hasil**: ...
5. **Diskusi**: ...
6. **Kesimpulan**: ...

Untuk setiap section, berikan 2-3 kalimat ringkasan.`,
      simplified: `Jelaskan jurnal/artikel ini dengan bahasa yang sangat mudah dipahami, seperti menjelaskan ke anak SMA. Hindari jargon teknis. Gunakan analogi jika perlu. Format dalam paragraf pendek yang mudah dibaca.`,
    };

    const systemPrompt = `Kamu adalah AI Research Summarizer yang ahli merangkum jurnal ilmiah dan artikel akademik.

Instruksi:
- Jawab dalam Bahasa Indonesia
- Abaikan daftar pustaka/referensi
- Fokus pada konten substantif
- Jika ada data statistik, sertakan angka pentingnya
- Selalu identifikasi: key findings, methodology, dan implications

Format output sebagai JSON dengan struktur:
{
  "summary": "ringkasan utama",
  "keyPoints": ["poin 1", "poin 2", ...],
  "importantTerms": [{"term": "istilah", "definition": "definisi"}],
  "citation": "format sitasi otomatis jika bisa dideteksi dari teks"
}`;

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
          { role: "user", content: `${modePrompts[mode] || modePrompts.quick}\n\n---\n\n${text.slice(0, 15000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_summary",
            description: "Return the structured summary",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                keyPoints: { type: "array", items: { type: "string" } },
                importantTerms: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      term: { type: "string" },
                      definition: { type: "string" },
                    },
                    required: ["term", "definition"],
                    additionalProperties: false,
                  },
                },
                citation: { type: "string" },
              },
              required: ["summary", "keyPoints", "importantTerms", "citation"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_summary" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result = { summary: "", keyPoints: [], importantTerms: [], citation: "" };
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("summarize-journal error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
