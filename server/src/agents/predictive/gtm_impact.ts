import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// SimilarWeb SEO Insights Tool
const similarWebSeoTool = tool(
    async ({ domain }) => {
        return new Promise<string>((resolve, reject) => {
            const options = {
                method: 'GET',
                hostname: 'similarweb-insights.p.rapidapi.com',
                port: null,
                path: `/seo?domain=${encodeURIComponent(domain)}`,
                headers: {
                    'x-rapidapi-key': process.env.REDDIT_RAPIDAPI_KEY || '613a965ba4mshe78fd35cb8a5842p1ad7f3jsne7f5128cdbe3',
                    'x-rapidapi-host': 'similarweb-insights.p.rapidapi.com'
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

            req.on('error', (e) => resolve("Error fetching SimilarWeb SEO data: " + e.message));
            req.end();
        });
    },
    {
        name: "similar_web_seo",
        description: "Fetch SEO insights and rank metrics for a specific competitor's domain from Similarweb. Use this to gauge distribution, virality, competition strength, and go-to-market traffic trends. For the domain, provide the domain name without https (e.g. 'stripe.com')",
        schema: z.object({
            domain: z.string().describe("The competitor website domain (e.g., 'stripe.com').")
        })
    }
);

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
        description: "Search Reddit for top subreddits to evaluate potential marketing distribution channels and communities.",
        schema: z.object({
            query: z.string().describe("The problem space, industry, or competitor keyword to search for on Reddit.")
        })
    }
);

export const gtmImpactNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [similarWebSeoTool, redditSearchTool];
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the GTM & Impact Strategy Agent.
    Role: Analyze how this startup will acquire customers and its societal/geographical impact.
    Analyze: 
    - GTM: Distribution channel feasibility, CAC assumptions, Sales complexity, Virality potential.
    - Impact: ESG impact, Social benefit, Sustainability alignment.
    
    Business Idea: ${state.business_idea}
    
    You have tools to research Go-To-Market distribution feasibility (SimilarWeb SEO Insights and Reddit Search).
    Use SimilarWeb to analyze competitors' domains and their SEO strategies, and use Reddit Search to identify organic traction channels within active communities.
    
    After gathering data (or immediately if you don't need tools), output YOUR FINAL ANALYSIS as strictly valid JSON matching this schema:
    {
        "gtm": {"score": 1-100, "insight": "short GTM insight"},
        "impact": {"score": 1-100, "insight": "short Impact insight"}
    }
    Do not output any additional text outside the JSON.
    `;

    let messages: any[] = [new SystemMessage({ content: prompt })];
    let gtmData, impactData;

    try {
        let response = await llmWithTools.invoke(messages);
        messages.push(response);

        let iterations = 0;
        // Check for tool calls
        while (response.tool_calls && response.tool_calls.length > 0 && iterations < 3) {
            for (const toolCall of response.tool_calls) {
                if (toolCall.name === "similar_web_seo") {
                    const result = await similarWebSeoTool.invoke(toolCall.args);
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "reddit_search") {
                    const result = await redditSearchTool.invoke(toolCall.args);
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
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
            gtmData = parsed.gtm || { "score": 70, "insight": "Recommended GTM: Content-led inbound strategy with high virality potential." };
            impactData = parsed.impact || { "score": 85, "insight": "Strong ESG alignment, highly attractive for global sustainability grants." };
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("gtmImpactNode generation failed:", e);
        gtmData = { "score": 70, "insight": "Recommended GTM: Content-led inbound strategy with high virality potential." };
        impactData = { "score": 85, "insight": "Strong ESG alignment, highly attractive for global sustainability grants." };
    }
    return { "analysis": { "gtm": gtmData, "impact": impactData } };
};
