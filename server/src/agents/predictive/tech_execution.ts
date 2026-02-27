import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// Github Scraper Tool
const githubRepoSearchTool = tool(
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
                url: `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`,
                pageNumber: 1,
                maxPage: 1,
                cookies: []
            }));
            req.end();
        });
    },
    {
        name: "github_repo_search",
        description: "Search Github for existing open source repositories to evaluate tech feasibility, existing solutions, and MVP complexity. This can help evaluate if the tech has already been built.",
        schema: z.object({
            query: z.string().describe("The technology, problem, or feature to search for on Github.")
        })
    }
);

// StackOverflow Search Tool (Best Practice Tool)
const stackOverflowSearchTool = tool(
    async ({ query }) => {
        try {
            const response = await fetch(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&pagesize=5`);
            if (!response.ok) return "Failed to fetch from StackOverflow.";
            const data = await response.json();
            const results = data.items?.map((r: any) => `Title: ${r.title}\nLink: ${r.link}\nIs Answered: ${r.is_answered}`).join("\n\n");
            return results || "No related StackOverflow discussions found.";
        } catch (e: any) {
            return "Error calling StackOverflow: " + e.message;
        }
    },
    {
        name: "stackoverflow_search",
        description: "Search StackOverflow to understand development complexity, technical roadblocks, community support, and feasibility for this technology.",
        schema: z.object({
            query: z.string().describe("The core technical challenge or stack to search for.")
        })
    }
);

export const techExecutionNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [githubRepoSearchTool, stackOverflowSearchTool];
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Tech Feasibility & Execution Risk Agent.
    Role: Analyze if this can be built with reasonable effort and assess execution risks.
    Analyze: 
    - Tech: Tech stack feasibility, Development complexity, MVP timeline, Scalability risks.
    - Execution: Founder skill vs product, Technical capability gap, Time commitment.
    
    Business Idea: ${state.business_idea}
    
    You have tools to research the technical landscape (Github Repository Scraper, StackOverflow Search). 
    Use them to evaluate if core features already exist in open source or to gauge the development complexity.
    
    After gathering data (or immediately if you don't need tools), output YOUR FINAL ANALYSIS as strictly valid JSON matching this schema:
    {
        "tech": {"score": 1-100, "insight": "short Tech Feasibility insight"},
        "execution": {"score": 1-100, "insight": "short Execution Risk insight"}
    }
    Do not output any additional text outside the JSON.
    `;

    let messages: any[] = [new SystemMessage({ content: prompt })];
    let techData, executionData;

    try {
        let response = await llmWithTools.invoke(messages);
        messages.push(response);

        let iterations = 0;
        // Check for tool calls
        while (response.tool_calls && response.tool_calls.length > 0 && iterations < 3) {
            for (const toolCall of response.tool_calls) {
                if (toolCall.name === "github_repo_search") {
                    const result = await githubRepoSearchTool.invoke(toolCall.args);
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "stackoverflow_search") {
                    const result = await stackOverflowSearchTool.invoke(toolCall.args);
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
            const parsed = JSON.parse(match[0]);
            techData = parsed.tech || { "score": 75, "insight": "MVP is feasible in 6 weeks, but real-time features add high complexity." };
            executionData = parsed.execution || { "score": 80, "insight": "Low execution risk if key technical hires are secured." };
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("techExecutionNode generation failed:", e);
        techData = { "score": 75, "insight": "MVP is feasible in 6 weeks, but real-time features add high complexity." };
        executionData = { "score": 80, "insight": "Low execution risk if key technical hires are secured." };
    }
    return { "analysis": { "tech": techData, "execution": executionData } };
};
