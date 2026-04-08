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
  english: string;
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

    const userPrompt = `Generate 3 Japanese word-order quiz questions for genre: ${genreList}, difficulty: ${difficulty}.

TASK DEFINITION:
Students see a Japanese sentence. They must arrange Japanese phrase BLOCKS into ENGLISH word order.
Each block is a Japanese chunk that directly corresponds to exactly one English word or short phrase.

STRICT RULES:
1. "blocks" = the Japanese sentence split into chunks, IN THE SAME ORDER AS THE JAPANESE SENTENCE (do NOT randomize - the frontend will shuffle them).
2. "answer" = the SAME chunks from "blocks", rearranged into ENGLISH word order. Every chunk in "blocks" must appear exactly once in "answer".
3. Each chunk must map to exactly one English word or short phrase. Do NOT split too finely (no particles alone) and do NOT merge too broadly.
4. "english" = the full, natural English translation sentence.
5. "hint" = one sentence in Japanese explaining the grammar point.

DIFFICULTY:
- 初級: 4–5 chunks, simple present/past
- 中級: 5–6 chunks, time/place expressions
- 上級: 6–8 chunks, complex clauses or passive

EXAMPLE (correct format):
Japanese: "私は昨日図書館で本を読みました"
blocks (Japanese order): ["私は", "昨日", "図書館で", "本を", "読みました"]
answer (English order): ["私は", "読みました", "本を", "図書館で", "昨日"]
english: "I read a book at the library yesterday."
hint: "場所や時間の副詞は英語では動詞の後ろに来ることが多い"

ANOTHER EXAMPLE:
Japanese: "彼女は毎朝公園を走ります"
blocks (Japanese order): ["彼女は", "毎朝", "公園を", "走ります"]
answer (English order): ["彼女は", "走ります", "公園を", "毎朝"]
english: "She runs in the park every morning."
hint: "頻度を表す副詞句は英語では文末に置かれることが多い"

Respond ONLY with valid JSON, no markdown:
{
  "questions": [
    {
      "japanese": "日本語の文",
      "blocks": ["日本語順の", "チャンク", "配列"],
      "answer": ["英語の語順に", "並べた", "チャンク配列"],
      "english": "The natural English translation.",
      "hint": "文法のポイント一文"
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
        system: "You are a strict Japanese language quiz generator. You split Japanese sentences into chunks that map 1:1 to English words/phrases. The 'blocks' array is always in Japanese sentence order. The 'answer' array contains the same chunks in English word order. Always respond with valid JSON only.",
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
