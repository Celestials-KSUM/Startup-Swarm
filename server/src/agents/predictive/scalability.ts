import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// Github Scraper Tool (Scalability perspective)
const githubInfraSearchTool = tool(
    async ({ query }) => {
        return new Promise<string>((resolve, reject) => {
            const options = {
                method: 'POST',
                hostname: 'github-profiles-trending-developers-repositories-scrapping.p.rapidapi.com',
                port: null,
                path: '/search',
                headers: {
                    'x-rapidapi-key': process.env.REDDIT_RAPIDAPI_KEY || '613a965ba4mshe78fd35cb8a5842p1ad7f3jsne7f5128cdbe3',
                    'x-rapidapi-host': 'github-profiles-trending-developers-repositories-scrapping.p.rapidapi.com',
                    'Content-Type': 'application/json'
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

            req.on('error', (e) => resolve("Error fetching Github data: " + e.message));

            req.write(JSON.stringify({
                url: `https://github.com/search?q=${encodeURIComponent(query + " architecture scale")}&type=repositories`,
                pageNumber: 1,
                maxPage: 1,
                cookies: []
            }));
            req.end();
        });
    },
    {
        name: "github_infra_search",
        description: "Search Github for infrastructure tools, databases, or micro-service repositories that might help scale the concept. Good for estimating if global scalable solutions exist or if dependencies are a bottleneck.",
        schema: z.object({
            query: z.string().describe("The infrastructural technology or bottleneck to search for on Github.")
        })
    }
);

// StackOverflow System Scale Tool
const stackOverflowScaleTool = tool(
    async ({ query }) => {
        try {
            const response = await fetch(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&q=${encodeURIComponent(query + " scalability performance bottleneck")}&site=stackoverflow&pagesize=5`);
            if (!response.ok) return "Failed to fetch from StackOverflow.";
            const data = await response.json();
            const results = data.items?.map((r: any) => `Title: ${r.title}\nScore: ${r.score}`).join("\n\n");
            return results || "No related scalability discussions found.";
        } catch (e: any) {
            return "Error calling StackOverflow: " + e.message;
        }
    },
    {
        name: "stackoverflow_scale_search",
        description: "Search StackOverflow specifically for scalability bottlenecks, architectural performance limits, and known infrastructure constraints for specific technologies.",
        schema: z.object({
            query: z.string().describe("The core technical or database stack to evaluate for scaling limits.")
        })
    }
);

export const scalabilityNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [githubInfraSearchTool, stackOverflowScaleTool];
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Scalability & Infrastructure Agent.
    Role: "Can this scale to 10x or 100x?"
    Analyze: Infrastructure complexity, Operational bottlenecks, Dependency risks, Supply chain limitations.
    Business Idea: ${state.business_idea}
    
    You have tools to verify system scale capacity (Github Infrastructure Search and StackOverflow Performance search).
    Use them to determine if technologies proposed or needed have severe architectural constraints or widely known scaling limitations.
    
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
                if (toolCall.name === "github_infra_search") {
                    const result = await githubInfraSearchTool.invoke(toolCall.args);
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "stackoverflow_scale_search") {
                    const result = await stackOverflowScaleTool.invoke(toolCall.args);
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
        console.error("scalabilityNode generation failed:", e);
        data = { "score": 65, "insight": "High dependency on specific supply chains limits rapid geographical expansion." };
    }
    return { "analysis": { "scalability": data } };
};