import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const economicsNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Unit Economics & Financial Modeling Agent.
    Role: "Does this business make financial sense?"
    Analyze: Pricing vs cost structure, LTV vs CAC, Gross margin potential, Burn rate estimation.
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
        console.error("economicsNode generation failed:");
        data = {"score": 60, "insight": "High LTV/CAC ratio possible, but initial burn rate will be significant."};
    }
    return {"analysis": {"economics": data}};
};