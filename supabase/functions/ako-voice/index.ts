 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
// Ako's ElevenLabs voice ID - Using Sarah (free tier compatible)
const AKO_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { text } = await req.json();
     const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
 
     if (!ELEVENLABS_API_KEY) {
       throw new Error("ELEVENLABS_API_KEY is not configured");
     }
 
     if (!text || text.trim().length === 0) {
       return new Response(JSON.stringify({ error: "No text provided" }), {
         status: 400,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Call ElevenLabs TTS API
     const response = await fetch(
       `https://api.elevenlabs.io/v1/text-to-speech/${AKO_VOICE_ID}?output_format=mp3_44100_128`,
       {
         method: "POST",
         headers: {
           "xi-api-key": ELEVENLABS_API_KEY,
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           text,
           model_id: "eleven_multilingual_v2",
           voice_settings: {
             stability: 0.5,
             similarity_boost: 0.75,
             style: 0.4,
             use_speaker_boost: true,
           },
         }),
       }
     );
 
     if (!response.ok) {
       const errorText = await response.text();
       console.error("ElevenLabs API error:", response.status, errorText);
       throw new Error(`ElevenLabs API error: ${response.status}`);
     }
 
     const audioBuffer = await response.arrayBuffer();
     const base64Audio = base64Encode(audioBuffer);
 
     return new Response(JSON.stringify({ audioContent: base64Audio }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("ako-voice error:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(JSON.stringify({ error: errorMessage }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });