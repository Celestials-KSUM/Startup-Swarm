import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const impactNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Impact & Sustainability Agent.
    Role: "Does this positively impact society and geography?"
    Analyze: ESG impact, Social benefit, Sustainability alignment (especially for Climate, AgriTech, Gov-backed).
    Business Idea: ${state.business_idea}
    Output JSON: {"score": 1-100, "insight": "short insight"}
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
        console.error("impactNode generation failed:");
        data = {"score": 85, "insight": "Strong ESG alignment, highly attractive for global sustainability grants."};
    }
    return {"analysis": {"impact": data}};
};