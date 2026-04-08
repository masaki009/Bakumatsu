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

    const userPrompt = `Generate 3 word-order quiz questions. Genre: ${genreList}. Difficulty: ${difficulty}.

HOW THE QUIZ WORKS:
- The student sees a Japanese sentence.
- The Japanese sentence is split into chunks (blocks).
- The student must drag/tap those blocks into ENGLISH word order.
- The correct arrangement of blocks in English order is stored in "answer".

STEP-BY-STEP PROCESS FOR EACH QUESTION:
Step 1. Write a natural Japanese sentence appropriate for the genre and difficulty.
Step 2. Write its natural English translation as "english".
Step 3. Split the Japanese sentence into chunks where EACH chunk corresponds to EXACTLY ONE English word or short phrase in the English translation. Do not leave any English word uncovered. Do not have any chunk that maps to nothing.
Step 4. "blocks" = those chunks listed IN JAPANESE SENTENCE ORDER (left to right as they appear).
Step 5. "answer" = those SAME chunks listed IN THE ORDER THEY APPEAR IN THE ENGLISH SENTENCE (left to right). This must exactly match the word order of "english".
Step 6. Verify: reading the "answer" array left-to-right should produce the same meaning as reading "english" word by word.

DIFFICULTY GUIDE:
- 初級: 4-5 chunks, simple present or past tense
- 中級: 5-6 chunks, includes time or place expressions
- 上級: 6-8 chunks, passive voice, relative clauses, or subordinate clauses

WORKED EXAMPLE:
Japanese: 私は毎朝公園でジョギングをします
English:  I jog in the park every morning

Chunk mapping (Japanese → English):
  私は       → I           (position 1 in English)
  毎朝       → every morning (position 5 in English)
  公園で     → in the park  (position 3 in English)
  ジョギングをします → jog    (position 2 in English)

blocks (Japanese order): ["私は", "毎朝", "公園で", "ジョギングをします"]
answer (English order):  ["私は", "ジョギングをします", "公園で", "毎朝"]

Verify: "私は" = I, "ジョギングをします" = jog, "公園で" = in the park, "毎朝" = every morning
=> "I jog in the park every morning" ✓ Matches english field.

ANOTHER EXAMPLE:
Japanese: 彼女はその映画を昨日図書館で見ました
English:  She watched that movie at the library yesterday

Chunk mapping:
  彼女は     → She           (position 1)
  その映画を → that movie    (position 3)
  昨日       → yesterday     (position 5)
  図書館で   → at the library (position 4)
  見ました   → watched       (position 2)

blocks: ["彼女は", "その映画を", "昨日", "図書館で", "見ました"]
answer: ["彼女は", "見ました", "その映画を", "図書館で", "昨日"]

Verify: "彼女は"=She, "見ました"=watched, "その映画を"=that movie, "図書館で"=at the library, "昨日"=yesterday
=> "She watched that movie at the library yesterday" ✓

OUTPUT FORMAT — respond with valid JSON only, no markdown fences:
{
  "questions": [
    {
      "japanese": "日本語文",
      "blocks": ["日本語順チャンク1", "チャンク2", "チャンク3"],
      "answer": ["英語の語順通りに並べたチャンク1", "チャンク2", "チャンク3"],
      "english": "The natural English translation sentence.",
      "hint": "文法ポイントの解説（日本語1文）"
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
        system: `You are a precise Japanese language quiz generator. Your job is to generate word-order quiz questions where Japanese sentence chunks must be arranged into English word order.

CRITICAL RULE: The "answer" array must list the chunks in the EXACT order they appear in the English sentence. If "english" is "She watched that movie at the library yesterday", then "answer" must list the chunks in the order: She-chunk, watched-chunk, that-movie-chunk, at-the-library-chunk, yesterday-chunk.

Always respond with valid JSON only, no markdown.`,
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
