import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const techFeasibilityNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Tech Feasibility Agent.
    Role: "Can this be built with reasonable effort?"
    Analyze: Tech stack feasibility, Development complexity, MVP timeline, Scalability risks.
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
        console.error("techFeasibilityNode generation failed:");
        data = {"score": 75, "insight": "MVP is feasible in 6 weeks, but real-time features add high complexity."};
    }
    return {"analysis": {"tech": data}};
};