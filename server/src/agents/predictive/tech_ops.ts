import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "http";

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
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'ab288d6beemshabac7d925d48af8p1ab3cdjsn221f7ae221c9',
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

export const techOpsNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const rawLlm = getStructuralLlm();
    const tools = [githubRepoSearchTool, stackOverflowSearchTool];
    const llm = rawLlm.bindTools(tools);

    const prompt = `You are an elite Autonomous Technology & Operations Agent.
Business Idea: ${state.business_idea}

Perform deep technical analysis across these 4 domains.
1. execution: "Can they actually build it?" (Team skills, difficulty)
2. tech: "Is the tech feasible right now?" (Stack, dependencies)
3. scalability: "If it explodes, does it crash?" (Capacity planning, server load)
4. supply_chain: "Are operations stable?" (Vendors, logistics or Cloud Providers logic)

CRITICAL PERFORMANCE INSTRUCTION (MINIMIZE API CALLS):
1. ONLY utilize your bound tools (github_repo_search, stackoverflow_search) if you lack the knowledge to assess feasibility. If you already know the tech stack well, SKIP the tools.
2. If you must use tools to check clones or roadblocks, make ALL necessary tool calls AT ONCE in parallel.
3. You MUST output your FINAL JSON payload immediately in your next response.

CRITICAL JSON OUTPUT REQUIREMENT:
{
  "execution": {"score": 85, "insight": "Clear technical path utilizing standard React/Express systems."},
  "tech": {"score": 90, "insight": "Standard open-source stack is sufficient with low GitHub repository competition."},
  "scalability": {"score": 75, "insight": "Needs robust containerized micro-architecture mapping."},
  "supply_chain": {"score": 95, "insight": "Fully digital deployment utilizing AWS lambda cuts scaling friction."}
}`;

    let messages: any[] = [new SystemMessage({ content: prompt })];
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
        const response = await llm.invoke(messages);
        messages.push(response);

        // Process Tool Calls
        if (response.tool_calls && response.tool_calls.length > 0) {
            for (const toolCall of response.tool_calls) {
                let toolResult: any = "";
                if (toolCall.name === "github_repo_search") {
                    toolResult = await githubRepoSearchTool.invoke(toolCall as any);
                } else if (toolCall.name === "stackoverflow_search") {
                    toolResult = await stackOverflowSearchTool.invoke(toolCall as any);
                }

                messages.push(
                    new ToolMessage({
                        content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
                        name: toolCall.name,
                        tool_call_id: toolCall.id as string,
                    })
                );
            }
            attempts++;
            continue;
        }

        // Process successful block to JSON
        let data;
        try {
            const content = typeof response.content === "string" ? response.content : "";
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                data = JSON.parse(match[0]);
                return { "analysis": data };
            } else {
                throw new Error("No JSON payload block found in tech ops end response.");
            }
        } catch (e) {
            console.error("techOpsNode parsing generation failed:", e);
            if (attempts >= maxAttempts - 1) break;
            messages.push(new HumanMessage({ content: "You MUST output a valid JSON object block inside curly braces for your analysis." }));
            attempts++;
        }
    }

    // Fallback logic
    return {
        "analysis": {
            "execution": { "score": 65, "insight": "Manageable implementation depending on team." },
            "tech": { "score": 80, "insight": "Uses standard libraries and proven methodologies." },
            "scalability": { "score": 70, "insight": "Standard cloud platforms suffice initially." },
            "supply_chain": { "score": 80, "insight": "Lightweight logistics or pure software plays are simpler." }
        }
    };
};
