import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const marketStrategyNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();

    const prompt = `
    You are the Market & Strategy Agent suite.
    Business Idea: ${state.business_idea}
    
    Perform analysis across these 5 domains and provide a score (1-100) and a short insight for each:
    1. market: "Will anyone actually buy this?" (Target customer, market size)
    2. competition: "How crowded is this space?" (Competitors, differentiation)
    3. pmf: "Product-Market Fit probability"
    4. gtm: "Go-to-Market Strategy" (Acquisition channels, launch plan)
    5. economics: "Unit Economics" (LTV/CAC, profitability)
    
    Output JSON MUST EXACTLY match this structure.
    CRITICAL: YOU MUST RETURN VALID JSON. DO NOT USE ANY DOUBLE QUOTES (") INSIDE THE INSIGHT STRINGS, USE SINGLE QUOTES (') INSTEAD.
    {
      "market": {"score": 85, "insight": "High growth market with room for entry."},
      "competition": {"score": 75, "insight": "Existing players move slow."},
      "pmf": {"score": 80, "insight": "Clear signal of product-market fit."},
      "gtm": {"score": 90, "insight": "Inbound acquisition via community works best."},
      "economics": {"score": 85, "insight": "Good LTV to CAC ratio."}
    }
    `;

    const response = await llm.invoke([new SystemMessage({ content: prompt })]);
    let data;
    try {
        const content = typeof response.content === "string" ? response.content : "";
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            data = JSON.parse(match[0]);
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("marketStrategyNode generation failed:", e);
        data = {
            "market": { "score": 70, "insight": "Market demand looks promising but localized." },
            "competition": { "score": 60, "insight": "Moderate competition, requires differentiation." },
            "pmf": { "score": 65, "insight": "Strong potential but needs validation." },
            "gtm": { "score": 50, "insight": "Requires a solid launch strategy." },
            "economics": { "score": 60, "insight": "Margins look acceptable for early stage." }
        };
    }
    return { "analysis": data };
};
