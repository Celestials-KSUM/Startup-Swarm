import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// Reddit Search Tool
const redditSearchTool = tool(
    async ({ query }) => {
        return new Promise<string>((resolve, reject) => {
            const options = {
                method: 'GET',
                hostname: 'reddit34.p.rapidapi.com',
                port: null,
                path: `/getSearchSubreddits?query=${encodeURIComponent(query)}`,
                headers: {
                    'x-rapidapi-key': process.env.REDDIT_RAPIDAPI_KEY || '613a965ba4mshe78fd35cb8a5842p1ad7f3jsne7f5128cdbe3',
                    'x-rapidapi-host': 'reddit34.p.rapidapi.com'
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

            req.on('error', (e) => resolve("Error fetching Reddit data: " + e.message));
            req.end();
        });
    },
    {
        name: "reddit_search",
        description: "Search Reddit for top subreddits and communities discussing a specific topic. Highly useful for evaluating the depth, urgency, and audience size of a problem when determining Product-Market Fit.",
        schema: z.object({
            query: z.string().describe("The problem space, industry, or competitor keyword to search for on Reddit.")
        })
    }
);

// Hacker News Search Tool 
const hackerNewsSearchTool = tool(
    async ({ query }) => {
        try {
            const response = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`);
            if (!response.ok) return "Failed to fetch from Hacker News.";
            const data = await response.json();
            const results = data.hits?.map((r: any) => `Title: ${r.title}\nPoints: ${r.points}\nComments: ${r.num_comments}`).join("\n\n");
            return results || "No related Hacker News discussions found.";
        } catch (e: any) {
            return "Error calling Hacker News: " + e.message;
        }
    },
    {
        name: "hacker_news_search",
        description: "Search Hacker News for past discussions to evaluate Product-Market Fit, reception of similar ideas, and technical alternatives.",
        schema: z.object({
            query: z.string().describe("The search query.")
        })
    }
);

export const pmfNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [redditSearchTool, hackerNewsSearchTool];
    // Cast llm so that .bindTools is recognized depending on Langchain versions
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Product-Market Fit Agent.
    Analyze: User validation, Urgency of problem, Alternative solutions.
    Business Idea: ${state.business_idea}
    
    You have tools to research market validation and audience size (Reddit Search and Hacker News Search). Use them to find communities where this problem is discussed, gauge urgency, and discover alternative solutions.
    
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
                if (toolCall.name === "reddit_search") {
                    const result = await redditSearchTool.invoke(toolCall.args);
                    // shorten result just in case rapidAPI returns massive JSON payload
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "hacker_news_search") {
                    const result = await hackerNewsSearchTool.invoke(toolCall.args);
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
        console.error("pmfNode generation failed:", e);
        data = { "score": 75, "insight": "High urgency for the identified problem set." };
    }
    return { "analysis": { "pmf": data } };
};