import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const legalNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Legal & Compliance Agent.
    Role: "Will this cause legal trouble later?"
    Analyze: Data privacy issues, IP risks, Regulatory requirements, Compliance (India/global).
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
        console.error("legalNode generation failed:");
        data = {"score": 65, "insight": "User data collection requires consent and data protection compliance."};
    }
    return {"analysis": {"legal": data}};
};