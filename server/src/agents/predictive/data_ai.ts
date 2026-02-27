import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const dataAiNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Data & AI Risk Agent.
    Role: "How defensible and reliable is the AI/Data moat?"
    Analyze: Model dependency, Data acquisition difficulty, Bias & reliability risks (Relevant for AI startups).
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
        console.error("dataAiNode generation failed:");
        data = {"score": 70, "insight": "Proprietary data acquisition is difficult, increasing dependency on foundational models."};
    }
    return {"analysis": {"data_ai": data}};
};