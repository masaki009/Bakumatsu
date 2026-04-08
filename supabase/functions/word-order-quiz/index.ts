import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  genres: string[];
  difficulty: string;
}

interface Question {
  japanese: string;
  blocks: string[];
  answer: string[];
  hint: string;
}

interface ApiResponse {
  questions: Question[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { genres, difficulty }: RequestBody = await req.json();

    if (!genres || genres.length === 0 || !difficulty) {
      return new Response(
        JSON.stringify({ error: "genres and difficulty are required" }),
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

    const genreList = genres.join(", ");

    const userPrompt = `Generate 3 Japanese-to-English word order quiz questions.
Genre: ${genreList}
Difficulty: ${difficulty}

Rules:
- 初級: 4–6 English blocks, simple present/past tense
- 中級: 5–7 blocks, include time/place/frequency expressions
- 上級: 6–8 blocks, complex clauses, passive voice, conditionals allowed

Respond ONLY with this JSON structure:
{
  "questions": [
    {
      "japanese": "日本語の文",
      "blocks": ["English", "word", "blocks", "in", "random", "order"],
      "answer": ["correct", "English", "word", "order"],
      "hint": "文法のコツを日本語で一文で"
    }
  ]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: "You are a Japanese-to-English grammar quiz generator. Always respond with valid JSON only. No markdown, no explanation.",
        messages: [{ role: "user", content: userPrompt }],
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

    const parsed: ApiResponse = JSON.parse(rawText);

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in word-order-quiz:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
