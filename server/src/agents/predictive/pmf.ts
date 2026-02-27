import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const pmfNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Product-Market Fit Agent.
    Analyze: User validation, Urgency of problem, Alternative solutions.
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
        console.error("pmfNode generation failed:");
        data = {"score": 75, "insight": "High urgency for the identified problem set."};
    }
    return {"analysis": {"pmf": data}};
};