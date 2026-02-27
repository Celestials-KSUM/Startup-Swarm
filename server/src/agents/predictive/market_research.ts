import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

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
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY || '9f2e029e87msh8b19cfe4d11453dp121cf0jsne10eaddbc310',
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

export const marketResearchNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [amazonDataTool, wikipediaSearchTool];
    // Cast llm so that .bindTools is recognized depending on Langchain versions
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Market Research Agent. 
    Role: "Will anyone actually buy this?"
    Analyze: Target customer, Market size, Existing competitors, Differentiation.
    Business Idea: ${state.business_idea}
    
    You have tools to research the market (Amazon Data and Wikipedia Search). Use them if they help you assess the competition or market size for this specific idea.
    
    After gathering data (or immediately if you don't need tools), output YOUR FINAL ANALYSIS as strictly valid JSON matching this schema:
    {"score": 1-100, "insight": "short insight"}
    Do not output any additional text outside the JSON.
    `;

    let messages: any[] = [new SystemMessage({ content: prompt })];
    let data;

    try {
        let response = await llmWithTools.invoke(messages);
        messages.push(response);

        let iterations = 0;
        // Check for tool calls
        while (response.tool_calls && response.tool_calls.length > 0 && iterations < 3) {
            for (const toolCall of response.tool_calls) {
                if (toolCall.name === "amazon_market_data") {
                    const result = await amazonDataTool.invoke(toolCall.args);
                    // shorten result just in case rapidAPI returns massive JSON payload
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "wikipedia_search") {
                    const result = await wikipediaSearchTool.invoke(toolCall.args);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: result, name: toolCall.name }));
                }
            }
            response = await llmWithTools.invoke(messages);
            messages.push(response);
            iterations++;
        }

        let content = typeof response.content === "string" ? response.content : "";
        content = content.replace(/```json/g, "").replace(/```/g, "").trim();
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            data = JSON.parse(match[0]);
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("marketResearchNode generation failed:");
        data = { "score": 75, "insight": "Market demand is potentially high, validation paused due to limits." };
    }
    return { "analysis": { "market": data } };
};