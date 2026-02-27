import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const investorOutreachNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const blueprint = state.blueprint || {};
    const prompt = `
    You are the Investor Outreach Automation Agent.
    Based on the following Startup Blueprint, generate an automated investor fundraising execution plan.
    
    Startup Blueprint:
    ${JSON.stringify(blueprint)}
    
    Your task:
    - Identify 3 relevant investor types/sectors (e.g., specific VC tags, Angel syndicates).
    - Determine the suitable stage (e.g., Pre-seed, Seed).
    - Draft a custom, personalized pitch email meant for an initial intro.
    - Generate an initial CRM tracking pipeline for sending intros, tracking open rates, and follow-ups.
    
    OUTPUT ONLY VALID JSON matching this schema:
    {
      "investorTargets": ["string"],
      "recommendedStage": "string",
      "pitchEmailDraft": "string",
      "crmPipeline": [
        {
          "investorType": "string",
          "status": "string (e.g., Intro Pending, Follow-up Scheduled)",
          "nextAction": "string"
        }
      ]
    }
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
        console.error("investorOutreachNode generation failed:");
        data = {
            "investorTargets": ["Seed VCs focused on tech", "Angel Investors network", "Strategic Corporate Investors"],
            "recommendedStage": "Pre-Seed",
            "pitchEmailDraft": "Subject: Innovative startup in your space\n\nHi [Investor Name],\n\nI noticed your recent investments and I wanted to share what we're building. We have a compelling solution and I would love to grab a brief 10 min call to explore if it aligns with your mandate.\n\nBest,\nFounder",
            "crmPipeline": [
                {"investorType": "Top Tier VC", "status": "Intro Pending", "nextAction": "Send email and track open rate"},
                {"investorType": "Angel Syndicate", "status": "Prospecting", "nextAction": "Find warm intro"}
            ]
        };
    }
    return {"execution_results": {"investorOutreach": data}};
};