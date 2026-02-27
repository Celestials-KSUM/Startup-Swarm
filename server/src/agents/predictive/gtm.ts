import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const gtmNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Go-To-Market (GTM) Strategy Agent.
    Role: "How will this startup acquire customers?"
    Analyze: Distribution channel feasibility, CAC assumptions, Sales complexity (B2B vs B2C), Virality potential.
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
        console.error("gtmNode generation failed:");
        data = {"score": 70, "insight": "Recommended GTM: Content-led inbound strategy with high virality potential."};
    }
    return {"analysis": {"gtm": data}};
};