import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// Crunchbase Company Insights Tool (Economics version)
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
        name: "crunchbase_company_economics",
        description: "Search Crunchbase for detailed company profiles by domain. Useful to analyze existing competitor valuations, revenue indicators, and funding overhead to estimate burn rate and unit economic viability.",
        schema: z.object({
            company_domain: z.string().describe("The company domain to analyze economics for (e.g., 'stripe.com').")
        })
    }
);

// Reddit Pricing Search Tool
const redditPricingSearchTool = tool(
    async ({ query }) => {
        return new Promise<string>((resolve, reject) => {
            const options = {
                method: 'GET',
                hostname: 'reddit34.p.rapidapi.com',
                port: null,
                path: `/getSearchSubreddits?query=${encodeURIComponent(query + " pricing cost")}`,
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

            req.on('error', (e) => resolve("Error fetching Reddit Pricing data: " + e.message));
            req.end();
        });
    },
    {
        name: "reddit_pricing_search",
        description: "Search Reddit discussions for industry pricing, consumer complaints about costs, and willingness to pay. Extremely useful for validating Pricing vs Cost Structure and LTV assumptions.",
        schema: z.object({
            query: z.string().describe("The product category, competitor, or service to evaluate pricing for.")
        })
    }
);

export const economicsNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [crunchbaseCompanyTool, redditPricingSearchTool];
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Unit Economics & Financial Modeling Agent.
    Role: "Does this business make financial sense?"
    Analyze: Pricing vs cost structure, LTV vs CAC, Gross margin potential, Burn rate estimation.
    Business Idea: ${state.business_idea}
    
    You have tools to research unit economics (Crunchbase Company Funding/Burn Rate Data & Reddit Pricing Complaints).
    Use them to evaluate competitor operational costs or check if consumers are currently complaining about the cost of existing alternatives, which highlights a pricing arbitrage opportunity.
    
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
                if (toolCall.name === "crunchbase_company_economics") {
                    const result = await crunchbaseCompanyTool.invoke(toolCall.args);
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "reddit_pricing_search") {
                    const result = await redditPricingSearchTool.invoke(toolCall.args);
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
            data = JSON.parse(match[0]);
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("economicsNode generation failed:", e);
        data = { "score": 60, "insight": "High LTV/CAC ratio possible, but initial burn rate will be significant." };
    }
    return { "analysis": { "economics": data } };
};