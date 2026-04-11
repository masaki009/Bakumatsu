import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  type: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { type }: RequestBody = await req.json();

    if (!type) {
      return new Response(
        JSON.stringify({ error: "type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const typeDescriptions: Record<string, string> = {
      "脱落・弱化": "Reduction/Weakening — sounds that are dropped or reduced (gonna, kinda, wanna, 't' dropping, weak vowels, etc.)",
      "同化": "Assimilation — adjacent sounds influence each other (did you → didʒu, hit you → hitʃu, this year → thisʃir, etc.)",
      "リンキング": "Linking — word boundaries merge so the last sound of one word links to the first of the next (an apple → ananple, pick it up → pickitup, etc.)",
      "短縮形": "Contraction — multiple words reduced to one (wanna=want to, gimme=give me, gonna=going to, dunno=don't know, etc.)",
      "ミックス": "Mix — a combination of multiple sound change types (reduction, assimilation, linking, and contraction) in one sentence",
    };

    const typeDescription = typeDescriptions[type] || type;

    const prompt = `Generate 3 English example sentences demonstrating the following sound change type: ${type} (${typeDescription}).

Rules:
- Prefer real movie or TV drama dialogue whenever possible. If you know the exact source, name it.
- Each sentence should clearly illustrate the specified sound change.
- For ミックス, include at least 2 different sound change types per sentence.

Return ONLY valid JSON with no markdown fences:
{
  "examples": [
    {
      "type": "${type}",
      "sentence": "The original English sentence as written",
      "spokenForm": "How it actually sounds when spoken naturally (show reduced/linked/assimilated forms in romaji or katakana hints inline)",
      "source": "Movie or drama title, or null if unknown",
      "translation": "日本語訳",
      "chunks": [
        {
          "original": "the original phrase (e.g., 'did you')",
          "phonetic": "カタカナ発音 (e.g., 'ディジュ')",
          "rule": "音変化の説明 (e.g., 'd+y→dʒ（ジュ音）')"
        }
      ],
      "miniLecture": "この音変化タイプについての日本語ミニレクチャー（3〜5文）。リスニングへの応用を含めて説明してください。"
    }
  ]
}

Important:
- chunks should contain 2–4 specific phrases from the sentence that demonstrate the sound change.
- miniLecture should be the same for all 3 examples (explaining the overall type), but sentence-specific chunks should reflect each sentence.
- Return exactly 3 examples.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        system: "You are an expert English phonetics and pronunciation teacher specializing in connected speech and sound changes. Generate authentic examples from real media when possible. Respond with valid JSON only, no markdown.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(
        JSON.stringify({ error: "Anthropic API error", details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let rawText: string = data.content[0].text;
    rawText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

    const parsed = JSON.parse(rawText);

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
