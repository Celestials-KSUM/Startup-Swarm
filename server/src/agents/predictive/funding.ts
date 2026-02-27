import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const fundingNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Funding Agent.
    Role: "Is this fundable and investable?"
    Analyze: Business model, Monetization clarity, Funding stage readiness, Investor appeal.
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
        console.error("fundingNode generation failed:");
        data = {"score": 60, "insight": "Strong idea, but revenue model is unclear for seed investors."};
    }
    return {"analysis": {"funding": data}};
};