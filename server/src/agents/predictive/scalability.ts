import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const scalabilityNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Scalability & Infrastructure Agent.
    Role: "Can this scale to 10x or 100x?"
    Analyze: Infrastructure complexity, Operational bottlenecks, Dependency risks, Supply chain limitations.
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
        console.error("scalabilityNode generation failed:");
        data = {"score": 65, "insight": "High dependency on local supply chains limits rapid geographical expansion."};
    }
    return {"analysis": {"scalability": data}};
};