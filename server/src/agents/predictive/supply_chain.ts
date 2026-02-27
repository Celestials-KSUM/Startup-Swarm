import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// World Bank Logistics Indicators Tool
const worldBankLogisticsTool = tool(
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

            req.on('error', (e) => resolve("Error fetching World Bank Trade data: " + e.message));
            req.end();
        });
    },
    {
        name: "world_bank_logistics_indicators",
        description: "Fetch World Bank Development Indicators relating to trade and logistics limits in global economies. Typical indicators: 'IC.BUS.EASE.XQ' (Ease of business), 'LP.LPI.OVRL.XQ' (Logistics Performance Index)",
        schema: z.object({
            country_code: z.string().describe("The 2 or 3 letter ISO country/region code (e.g. 'US', 'IN', 'EUU')."),
            indicator: z.string().describe("The specific World Bank indicator code for logistics (e.g. 'LP.LPI.OVRL.XQ').")
        })
    }
);

// Wikipedia Logistics Infrastructure Search Tool
const wikipediaLogisticsSearchTool = tool(
    async ({ query }) => {
        try {
            const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " logistics supply chain physical delivery")}&utf8=&format=json`);
            if (!response.ok) return "Failed to fetch from Wikipedia.";
            const data = await response.json();
            const results = data.query?.search?.map((r: any) => `${r.title}: ${r.snippet}`).slice(0, 3).join("\n");
            return results ? results.replace(/<[^>]*>?/gm, '') : "No physical supply chain results found.";
        } catch (e: any) {
            return "Error calling Wikipedia for logistics mapping: " + e.message;
        }
    },
    {
        name: "wikipedia_logistics_search",
        description: "Search Wikipedia specifically targeting established knowledge about global physical supply chains, vendor dependencies, hardware manufacturing logic, and material delivery constraints.",
        schema: z.object({
            query: z.string().describe("The physical pipeline to search for (e.g., 'EV batteries', 'cloud kitchens', 'shipping container').")
        })
    }
);

export const supplyChainNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [worldBankLogisticsTool, wikipediaLogisticsSearchTool];
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Supply Chain & Operations Agent.
    Role: "How complex and risky is the physical delivery/operations?"
    Analyze: Vendor dependency, Logistics complexity, Inventory risk (especially for Food, Hardware, Consumer Goods).
    Business Idea: ${state.business_idea}
    
    You have tools to measure international operational scaling viability (World Bank Logistics/Ease of Business data) and to lookup specific supply chain workflows (Wikipedia Logistics search).
    Use them to determine if physical delivery or hardware logistics are extremely difficult, capital intensive, or constrained.
    
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
                if (toolCall.name === "world_bank_logistics_indicators") {
                    const result = await worldBankLogisticsTool.invoke(toolCall.args);
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "wikipedia_logistics_search") {
                    const result = await wikipediaLogisticsSearchTool.invoke(toolCall.args);
                    // shortResult shouldn't be too long because of Wikipedia text slice
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
        console.error("supplyChainNode generation failed:", e);
        data = { "score": 60, "insight": "High inventory risk and complex logistics could strain early cash flow." };
    }
    return { "analysis": { "supply_chain": data } };
};