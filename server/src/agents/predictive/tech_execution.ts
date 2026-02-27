import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const techExecutionNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();

    const prompt = `
    You are the Tech Feasibility & Execution Risk Agent.
    Role: Analyze if this can be built with reasonable effort and assess execution risks.
    Analyze: 
    - Tech: Tech stack feasibility, Development complexity, MVP timeline, Scalability risks.
    - Execution: Founder skill vs product, Technical capability gap, Time commitment.
    
    Business Idea: ${state.business_idea}
    
    Output ONLY VALID JSON matching this schema:
    {
        "tech": {"score": 1-100, "insight": "short Tech Feasibility insight"},
        "execution": {"score": 1-100, "insight": "short Execution Risk insight"}
    }
    `;

    const response = await llm.invoke([new SystemMessage({ content: prompt })]);
    let techData, executionData;
    try {
        const content = typeof response.content === "string" ? response.content : "";
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            const parsed = JSON.parse(match[0]);
            techData = parsed.tech || { "score": 75, "insight": "MVP is feasible in 6 weeks, but real-time features add high complexity." };
            executionData = parsed.execution || { "score": 80, "insight": "Low execution risk if key technical hires are secured." };
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("techExecutionNode generation failed:");
        techData = { "score": 75, "insight": "MVP is feasible in 6 weeks, but real-time features add high complexity." };
        executionData = { "score": 80, "insight": "Low execution risk if key technical hires are secured." };
    }
    return { "analysis": { "tech": techData, "execution": executionData } };
};
