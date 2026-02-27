import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// Crunchbase Company Insights Tool (Funding API)
const crunchbaseCompanyTool = tool(
    async ({ company_domain }) => {
        return new Promise<string>((resolve, reject) => {
            const options = {
                method: 'POST',
                hostname: 'crunchbase4.p.rapidapi.com',
                port: null,
                path: '/company',
                headers: {
                    'x-rapidapi-key': process.env.REDDIT_RAPIDAPI_KEY || '613a965ba4mshe78fd35cb8a5842p1ad7f3jsne7f5128cdbe3',
                    'x-rapidapi-host': 'crunchbase4.p.rapidapi.com',
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

            req.on('error', (e) => resolve("Error fetching Crunchbase Company data: " + e.message));

            req.write(JSON.stringify({
                company_domain: company_domain
            }));
            req.end();
        });
    },
    {
        name: "crunchbase_company_funding",
        description: "Search Crunchbase for detailed company profiles by domain. Useful to analyze investor appeal, funding stage readiness and competitors' past funding rounds.",
        schema: z.object({
            company_domain: z.string().describe("The company domain to analyze (e.g., 'apple.com' or 'stripe.com').")
        })
    }
);

// Hacker News Search Tool (Great for checking funding buzz / announcements)
const hackerNewsFundingSearchTool = tool(
    async ({ query }) => {
        try {
            const response = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query + " funding raise")}&tags=story&hitsPerPage=5`);
            if (!response.ok) return "Failed to fetch from Hacker News.";
            const data = await response.json();
            const results = data.hits?.map((r: any) => `Title: ${r.title}\nPoints: ${r.points}\nComments: ${r.num_comments}\nURL: ${r.url}`).join("\n\n");
            return results || "No related Hacker News funding discussions found.";
        } catch (e: any) {
            return "Error calling Hacker News: " + e.message;
        }
    },
    {
        name: "hacker_news_funding_search",
        description: "Search Hacker News for startup funding round announcements and discussion. Great for understanding what type of startups get funded and investor appetite.",
        schema: z.object({
            query: z.string().describe("The industry or concept to search funding history for (e.g., 'AI coding assistant').")
        })
    }
);

export const fundingNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [crunchbaseCompanyTool, hackerNewsFundingSearchTool];
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Funding Agent.
    Role: "Is this fundable and investable?"
    Analyze: Business model, Monetization clarity, Funding stage readiness, Investor appeal.
    Business Idea: ${state.business_idea}
    
    You have tools to research investor sentiment and funding data for similar companies (Crunchbase Company API, HackerNews Funding Search).
    Use them to evaluate competitors' funding rounds or verify if this kind of startup excites investors.
    
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
                if (toolCall.name === "crunchbase_company_funding") {
                    const result = await crunchbaseCompanyTool.invoke(toolCall.args);
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "hacker_news_funding_search") {
                    const result = await hackerNewsFundingSearchTool.invoke(toolCall.args);
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
        console.error("fundingNode generation failed:", e);
        data = { "score": 60, "insight": "Strong idea, but revenue model is unclear for seed investors." };
    }
    return { "analysis": { "funding": data } };
};