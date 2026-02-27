import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// Crunchbase Search Tool
const crunchbaseTool = tool(
    async ({ query }) => {
        return new Promise<string>((resolve, reject) => {
            // RapidAPI configuration for Crunchbase Autocomplete
            const options = {
                method: 'GET',
                hostname: 'crunchbase-crunchbase-v1.p.rapidapi.com',
                port: null,
                path: `/autocompletes?query=${encodeURIComponent(query)}`,
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY || '9f2e029e87msh8b19cfe4d11453dp121cf0jsne10eaddbc310',
                    'x-rapidapi-host': 'crunchbase-crunchbase-v1.p.rapidapi.com'
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

            req.on('error', (e) => resolve("Error fetching Crunchbase info: " + e.message));
            req.end();
        });
    },
    {
        name: "crunchbase_search",
        description: "Search Crunchbase for autocomplete company and competitor names based on a search query. Useful for discovering related companies in an industry.",
        schema: z.object({
            query: z.string().describe("The competitor name, company, or industry keyword to search for.")
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
        description: "Search Wikipedia for general knowledge, known competitors, and market history.",
        schema: z.object({
            query: z.string().describe("The search query.")
        })
    }
);

export const competitionIntelNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [crunchbaseTool, wikipediaSearchTool];
    // Cast llm so that .bindTools is recognized depending on Langchain versions
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Competition Intelligence Agent.
    Analyze: Moat strength, Network effects, Switching costs, IP defensability.
    Business Idea: ${state.business_idea}
    
    You have tools to research the competition (Crunchbase Autocomplete and Wikipedia Search). Use them if they help you assess the competitive landscape for this specific idea.
    
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
                if (toolCall.name === "crunchbase_search") {
                    const result = await crunchbaseTool.invoke(toolCall.args);
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
        console.error("competitionIntelNode generation failed:", e);
        data = { "score": 65, "insight": "Defensibility relies on execution speed and brand quality." };
    }
    return { "analysis": { "competition": data } };
};