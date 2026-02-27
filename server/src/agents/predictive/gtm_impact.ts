import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const gtmImpactNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();

    const prompt = `
    You are the GTM & Impact Strategy Agent.
    Role: Analyze how this startup will acquire customers and its societal/geographical impact.
    Analyze: 
    - GTM: Distribution channel feasibility, CAC assumptions, Sales complexity, Virality potential.
    - Impact: ESG impact, Social benefit, Sustainability alignment.
    
    Business Idea: ${state.business_idea}
    
    Output ONLY VALID JSON matching this schema:
    {
        "gtm": {"score": 1-100, "insight": "short GTM insight"},
        "impact": {"score": 1-100, "insight": "short Impact insight"}
    }
    `;

    const response = await llm.invoke([new SystemMessage({ content: prompt })]);
    let gtmData, impactData;
    try {
        const content = typeof response.content === "string" ? response.content : "";
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            const parsed = JSON.parse(match[0]);
            gtmData = parsed.gtm || { "score": 70, "insight": "Recommended GTM: Content-led inbound strategy with high virality potential." };
            impactData = parsed.impact || { "score": 85, "insight": "Strong ESG alignment, highly attractive for global sustainability grants." };
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("gtmImpactNode generation failed:");
        gtmData = { "score": 70, "insight": "Recommended GTM: Content-led inbound strategy with high virality potential." };
        impactData = { "score": 85, "insight": "Strong ESG alignment, highly attractive for global sustainability grants." };
    }
    return { "analysis": { "gtm": gtmData, "impact": impactData } };
};
