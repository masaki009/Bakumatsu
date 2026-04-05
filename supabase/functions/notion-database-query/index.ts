import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotionProperty {
  id: string;
  type: string;
  [key: string]: any;
}

interface NotionPage {
  id: string;
  properties: Record<string, NotionProperty>;
  url: string;
  created_time: string;
  last_edited_time: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
    const NOTION_DATABASE_ID = Deno.env.get("NOTION_DATABASE_ID");

    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
      return new Response(
        JSON.stringify({ error: "Notion API key or Database ID not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "query";

    if (action === "query") {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${NOTION_API_KEY}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page_size: 100,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({ error: `Notion API error: ${response.status} - ${errorText}` }),
          {
            status: response.status,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const data = await response.json();

      const formattedResults = data.results.map((page: NotionPage) => {
        const properties = page.properties;

        const getName = (prop: NotionProperty) => {
          if (prop.type === "title") {
            return prop.title?.[0]?.plain_text || "";
          }
          return "";
        };

        const getUrl = (prop: NotionProperty) => {
          if (prop.type === "url") {
            return prop.url || "";
          }
          return "";
        };

        const getStatus = (prop: NotionProperty) => {
          if (prop.type === "status") {
            return prop.status?.name || "";
          }
          return "";
        };

        const getFiles = (prop: NotionProperty) => {
          if (prop.type === "files") {
            return prop.files?.map((file: any) => ({
              name: file.name,
              url: file.file?.url || file.external?.url || "",
            })) || [];
          }
          return [];
        };

        const getRichText = (prop: NotionProperty) => {
          if (prop.type === "rich_text") {
            return prop.rich_text?.[0]?.plain_text || "";
          }
          return "";
        };

        return {
          id: page.id,
          name: getName(properties.name || properties.Name),
          url: getUrl(properties.url || properties.URL),
          status: getStatus(properties.status || properties.Status),
          sound: getRichText(properties.sound || properties.Sound),
          files: getFiles(properties["files & media"] || properties["Files & media"]),
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
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
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
