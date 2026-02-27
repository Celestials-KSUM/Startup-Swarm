import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const executionRiskNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Execution Risk Agent.
    Analyze: Founder skill vs product, Technical capability gap, Time commitment.
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
        console.error("executionRiskNode generation failed:");
        data = {"score": 80, "insight": "Low execution risk if key technical hires are secured."};
    }
    return {"analysis": {"execution": data}};
};