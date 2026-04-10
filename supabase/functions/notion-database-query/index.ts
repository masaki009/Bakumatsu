import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const body = await req.json();
    const { db_type } = body;

    if (!db_type) {
      return new Response(
        JSON.stringify({ error: "db_type が必要です (chunk, vocab, jtoe, simul)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: notionSettings, error: notionError } = await supabaseClient
      .from("user_notion")
      .select("notion_api_key, db_id_chunk, db_id_vocab, db_id_jtoe, db_id_simul")
      .maybeSingle();

    if (notionError || !notionSettings) {
      return new Response(
        JSON.stringify({ error: "Notionの設定が見つかりません。設定画面でAPIキーとDB IDを登録してください。", not_configured: true }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const notionApiKey = notionSettings.notion_api_key;
    const dbIdMap: Record<string, string> = {
      chunk: notionSettings.db_id_chunk,
      vocab: notionSettings.db_id_vocab,
      jtoe: notionSettings.db_id_jtoe,
      simul: notionSettings.db_id_simul,
    };
    const databaseId = dbIdMap[db_type];

    if (!notionApiKey || !databaseId) {
      return new Response(
        JSON.stringify({ error: `NotionのAPIキーまたは${db_type}のDB IDが設定されていません。`, not_configured: true }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${notionApiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 100 }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `Notion APIエラー: ${response.status} - ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const formattedResults = data.results.map((page: any) => {
      const properties = page.properties;

      let title = "";
      for (const key of Object.keys(properties)) {
        const prop = properties[key];
        if (prop.type === "title" && prop.title?.[0]?.plain_text) {
          title = prop.title[0].plain_text;
          break;
        }
      }

      const richTexts: Record<string, string> = {};
      for (const [key, prop] of Object.entries(properties) as [string, any][]) {
        if (prop.type === "rich_text" && prop.rich_text?.[0]?.plain_text) {
          richTexts[key] = prop.rich_text[0].plain_text;
        }
      }

      let status = "";
      for (const [, prop] of Object.entries(properties) as [string, any][]) {
        if (prop.type === "status") {
          status = prop.status?.name || "";
          break;
        }
      }

      let select = "";
      for (const [, prop] of Object.entries(properties) as [string, any][]) {
        if (prop.type === "select") {
          select = prop.select?.name || "";
          break;
        }
      }

      return {
        id: page.id,
        title,
        status,
        select,
        richTexts,
        notionUrl: page.url,
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
      };
    });

    return new Response(
      JSON.stringify({
        results: formattedResults,
        has_more: data.has_more,
        next_cursor: data.next_cursor,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
