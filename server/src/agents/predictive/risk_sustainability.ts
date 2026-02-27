import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const riskSustainabilityNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();

    const prompt = `
    You are the Risk & Sustainability Agent suite.
    Business Idea: ${state.business_idea}
    
    Perform analysis across these 4 domains and provide a score (1-100) and a short insight for each:
    1. funding: "Will VCs touch this?" (Valuation, capital required)
    2. legal: "Are there lawsuits waiting to happen?" (Regulations, IP protection)
    3. impact: "Does this help or hurt the world?" (ESG, externalities)
    4. data_ai: "Is the data strategy safe?" (Privacy, security, ML risk)
    
    Output JSON MUST EXACTLY match this structure:
    {
      "funding": {"score": 1-100, "insight": "short insight"},
      "legal": {"score": 1-100, "insight": "short insight"},
      "impact": {"score": 1-100, "insight": "short insight"},
      "data_ai": {"score": 1-100, "insight": "short insight"}
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
        console.error("riskSustainabilityNode generation failed:", e);
        data = {
            "funding": { "score": 60, "insight": "Requires bootstrapping first." },
            "legal": { "score": 85, "insight": "Low regulatory burden." },
            "impact": { "score": 75, "insight": "Neutral to positive environmental footprint." },
            "data_ai": { "score": 70, "insight": "Basic privacy measures needed." }
        };
    }
    return { "analysis": data };
};
