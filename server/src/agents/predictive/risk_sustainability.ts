import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as https from "https";
import * as http from "http";

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
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY || '613a965ba4mshe78fd35cb8a5842p1ad7f3jsne7f5128cdbe3',
                    'x-rapidapi-host': 'word-bank-world-development-indicators.p.rapidapi.com'
                }
            };

            const req = https.request(options, function (res) {
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

// SimilarWeb and Reddit Search tools removed for token optimization

export const riskSustainabilityNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const rawLlm = getStructuralLlm();
    const tools = [worldBankIndicatorsTool, wikipediaRegulatorySearchTool];
    const llm = rawLlm.bindTools(tools);

    const prompt = `You are an elite Autonomous Risk & Sustainability Agent suite.
Business Idea: ${state.business_idea}

Perform deep analytical research across these 4 domains.
1. funding: "Will VCs touch this?" (Valuation, capital required)
2. legal: "Are there lawsuits waiting to happen?" (Regulations, IP protection)
3. impact: "Does this help or hurt the world?" (ESG, externalities)
4. data_ai: "Is the data strategy safe?" (Privacy, security, ML risk)

CRITICAL PERFORMANCE INSTRUCTION (MINIMIZE API CALLS):
1. ONLY utilize your bound tools (world_bank_indicators, wikipedia_regulatory_search) if you definitively lack factual context. If you understand the space, SKIP tools to save time.
2. If you must gather competitive or macroeconomic data, execute ALL tool calls sequentially or parallel within ONE SINGLE TURN. Do NOT chain tool calls back-to-back.
3. You MUST output the FINAL JSON payload immediately afterward.

CRITICAL JSON OUTPUT REQUIREMENT:
{
  "funding": {"score": 75, "insight": "Requires heavy seed capital."},
  "legal": {"score": 90, "insight": "No major IP risks found."},
  "impact": {"score": 85, "insight": "Positive environmental footprint."},
  "data_ai": {"score": 80, "insight": "Standard privacy standards apply."}
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

                if (toolCall.name === "world_bank_indicators") {
                    toolResult = await worldBankIndicatorsTool.invoke(toolCall as any);
                } else if (toolCall.name === "wikipedia_regulatory_search") {
                    toolResult = await wikipediaRegulatorySearchTool.invoke(toolCall as any);
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
                throw new Error("No JSON payload block found in risk sustainability end response.");
            }
        } catch (e) {
            console.error("riskSustainabilityNode parsing generation failed:", e);
            if (attempts >= maxAttempts - 1) break;
            messages.push(new HumanMessage({ content: "You MUST output a valid JSON object block inside curly braces for your analysis." }));
            attempts++;
        }
    }

    // Fallback logic
    return {
        "analysis": {
            "funding": { "score": 60, "insight": "Requires bootstrapping first." },
            "legal": { "score": 85, "insight": "Low regulatory burden." },
            "impact": { "score": 75, "insight": "Neutral to positive environmental footprint." },
            "data_ai": { "score": 70, "insight": "Basic privacy measures needed." }
        }
    };
};
