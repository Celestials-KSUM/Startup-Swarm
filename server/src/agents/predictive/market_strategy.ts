import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "http";

// Amazon Data Tool using the rapidAPI snippet
const amazonDataTool = tool(
    async ({ category_id }) => {
        return new Promise<string>((resolve, reject) => {
            const options = {
                method: 'GET',
                hostname: 'real-time-amazon-data.p.rapidapi.com',
                port: null,
                path: `/products-by-category?category_id=${encodeURIComponent(category_id)}`,
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
                    'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
                }
            };

            const req = http.request(options, function (res) {
                const chunks: Buffer[] = [];
                res.on('data', function (chunk) {
                    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
                });
                res.on('end', function () {
                    const body = Buffer.concat(chunks);
                    resolve(body.toString());
                });
            });

            req.on('error', (e) => resolve("Error fetching Amazon data: " + e.message));
            req.end();
        });
    },
    {
        name: "amazon_market_data",
        description: "Fetch real-time Amazon products data by category. Use this to perform market research on e-commerce trends and competitors. Common category_id values: 'aps' (All Departments), 'automotive', 'software', 'electronics'.",
        schema: z.object({
            category_id: z.string().describe("The Amazon category ID to search in, e.g. 'aps' or 'software'.")
        })
    }
);

// Wikipedia Search Tool
const wikipediaSearchTool = tool(
    async ({ query }) => {
        try {
            const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`);
            if (!response.ok) return "Failed to fetch from Wikipedia.";
            const data = await response.json();
            const results = data.query?.search?.map((r: any) => `${r.title}: ${r.snippet}`).slice(0, 3).join("\n");
            return results ? results.replace(/<[^>]*>?/gm, '') : "No results found.";
        } catch (e: any) {
            return "Error calling Wikipedia: " + e.message;
        }
    },
    {
        name: "wikipedia_search",
        description: "Search Wikipedia for general knowledge, market history, competitors backgrounds, and technology definitions.",
        schema: z.object({
            query: z.string().describe("The search query.")
        })
    }
);

export const marketStrategyNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const rawLlm = getStructuralLlm();
    const tools = [amazonDataTool, wikipediaSearchTool];
    const llm = rawLlm.bindTools(tools);

    const prompt = `You are an elite Autonomous Market & Strategy Agent.
Business Idea: ${state.business_idea}

Your goal is to perform deep fundamental analysis across 5 domains.
1. market: "Will anyone actually buy this?" (Target customer, market size)
2. competition: "How crowded is this space?" (Competitors, differentiation)
3. pmf: "Product-Market Fit probability"
4. gtm: "Go-to-Market Strategy" (Acquisition channels, launch plan)
5. economics: "Unit Economics" (LTV/CAC, profitability)

CRITICAL PERFORMANCE INSTRUCTION (MINIMIZE API CALLS):
1. ONLY use your bound tools (wikipedia_search, amazon_market_data) if absolutely necessary. If you already have strong empirical intuition, SKIP tool usage entirely.
2. If you must use tools, make ALL tool calls in ONE single parallel action. Do NOT call tools sequentially.
3. You MUST output the FINAL JSON payload immediately upon having enough data.

CRITICAL JSON OUTPUT REQUIREMENT:
{
  "market": {"score": 85, "insight": "High growth market with room for entry."},
  "competition": {"score": 75, "insight": "Existing players move slow."},
  "pmf": {"score": 80, "insight": "Clear signal of product-market fit."},
  "gtm": {"score": 90, "insight": "Inbound acquisition via community works best."},
  "economics": {"score": 85, "insight": "Good LTV to CAC ratio."}
}`;

    let messages: any[] = [new SystemMessage({ content: prompt })];
    let attempts = 0;
    const maxAttempts = 2; // Reduced from 3 to limit excess API calls

    while (attempts < maxAttempts) {
        const response = await llm.invoke(messages);
        messages.push(response);

        // Process Tool Calls if any
        if (response.tool_calls && response.tool_calls.length > 0) {
            for (const toolCall of response.tool_calls) {
                let toolResult: any = "";
                if (toolCall.name === "amazon_market_data") {
                    toolResult = await amazonDataTool.invoke(toolCall as any);
                } else if (toolCall.name === "wikipedia_search") {
                    toolResult = await wikipediaSearchTool.invoke(toolCall as any);
                }

                messages.push(
                    new ToolMessage({
                        content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
                        name: toolCall.name,
                        tool_call_id: toolCall.id as string,
                    })
                );
            }
            // Loop back to llm.invoke() so it can read the Tool contents
            attempts++;
            continue;
        }

        // Processing successful string content to JSON
        let data;
        try {
            const content = typeof response.content === "string" ? response.content : "";
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                data = JSON.parse(match[0]);
                return { "analysis": data };
            } else {
                throw new Error("No JSON payload block found in end response.");
            }
        } catch (e) {
            console.error("marketStrategyNode parsing generation failed:", e);
            if (attempts >= maxAttempts - 1) break; // Break and fallback
            messages.push(new HumanMessage({ content: "You MUST output a valid JSON object block inside curly braces, without prefix text." }));
            attempts++;
        }
    }

    // Fallback if all logic generation loops shatter
    return {
        "analysis": {
            "market": { "score": 70, "insight": "Market demand looks promising but localized." },
            "competition": { "score": 60, "insight": "Moderate competition, requires differentiation." },
            "pmf": { "score": 65, "insight": "Strong potential but needs validation." },
            "gtm": { "score": 50, "insight": "Requires a solid launch strategy." },
            "economics": { "score": 60, "insight": "Margins look acceptable for early stage." }
        }
    };
};
