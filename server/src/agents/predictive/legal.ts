import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// World Bank Development Indicators Tool
const worldBankIndicatorsTool = tool(
    async ({ country_code, indicator }) => {
        return new Promise<string>((resolve, reject) => {
            const options = {
                method: 'GET',
                hostname: 'word-bank-world-development-indicators.p.rapidapi.com',
                port: null,
                path: `/data?country=${encodeURIComponent(country_code)}&indicator=${encodeURIComponent(indicator)}`,
                headers: {
                    'x-rapidapi-key': process.env.REDDIT_RAPIDAPI_KEY || '613a965ba4mshe78fd35cb8a5842p1ad7f3jsne7f5128cdbe3',
                    'x-rapidapi-host': 'word-bank-world-development-indicators.p.rapidapi.com'
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

            req.on('error', (e) => resolve("Error fetching World Bank data: " + e.message));
            req.end();
        });
    },
    {
        name: "world_bank_indicators",
        description: "Fetch World Bank Development Indicators for a specific country. This can be used to assess country-level macroeconomic conditions, GDP, infrastructure stability, and broader development markers that could affect regulatory or compliance constraints. Typical countries: 'US', 'IN', 'EUU'. Typical indicators: 'NY.GDP.MKTP.CD' (GDP).",
        schema: z.object({
            country_code: z.string().describe("The 2 or 3 letter ISO country/region code (e.g. 'US', 'IN', 'EUU')."),
            indicator: z.string().describe("The specific World Bank indicator code (e.g. 'NY.GDP.MKTP.CD').")
        })
    }
);

// Wikipedia Legal Framework & Compliance Search Tool
const wikipediaRegulatorySearchTool = tool(
    async ({ query }) => {
        try {
            const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " law regulation compliance")}&utf8=&format=json`);
            if (!response.ok) return "Failed to fetch from Wikipedia.";
            const data = await response.json();
            const results = data.query?.search?.map((r: any) => `${r.title}: ${r.snippet}`).slice(0, 3).join("\n");
            return results ? results.replace(/<[^>]*>?/gm, '') : "No regulatory results found.";
        } catch (e: any) {
            return "Error calling Wikipedia for legal frameworks: " + e.message;
        }
    },
    {
        name: "wikipedia_regulatory_search",
        description: "Search Wikipedia specifically targeting established corporate laws, regulatory compliance acts, data protection frameworks (like GDPR, HIPAA, SOC2), and historical legal issues in specific industries.",
        schema: z.object({
            query: z.string().describe("The industry sector or regulatory keyword to search for (e.g., 'healthcare records', 'cryptocurrency', 'fintech').")
        })
    }
);

export const legalNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [worldBankIndicatorsTool, wikipediaRegulatorySearchTool];
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Legal & Compliance Agent.
    Role: "Will this cause legal trouble later?"
    Analyze: Data privacy issues, IP risks, Regulatory requirements, Compliance (India/global).
    Business Idea: ${state.business_idea}
    
    You have tools to assess international development stability constraints via the World Bank API, and a Wikipedia Regulator Search tool to look up regulatory acts, bills, and data compliance standards.
    Use them to evaluate potential global macro risks or to identify which specific governing frameworks (like GDPR or HIPAA) this startup would fall under.
    
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
                if (toolCall.name === "world_bank_indicators") {
                    const result = await worldBankIndicatorsTool.invoke(toolCall.args);
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "wikipedia_regulatory_search") {
                    const result = await wikipediaRegulatorySearchTool.invoke(toolCall.args);
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
        console.error("legalNode generation failed:", e);
        data = { "score": 65, "insight": "User data collection requires consent and data protection compliance." };
    }
    return { "analysis": { "legal": data } };
};