import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const outreachNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const blueprint = state.blueprint || {};
    const prompt = `
    You are the Partnership & Outreach Agent.
    Based on the following Startup Blueprint, generate an automated partnership and outreach execution plan.
    
    Startup Blueprint:
    ${JSON.stringify(blueprint)}
    
    Your task:
    - Identify 4-5 categories of potential partners or specific types of organizations (e.g., Farming cooperatives, Distributors for AgriTech).
    - Draft a personalized, high-converting cold outreach email template meant for API/SMTP scheduling.
    - Generate an initial CRM pipeline tracking the Prospecting state and next automated actions.
    
    OUTPUT ONLY VALID JSON matching this schema:
    {
      "potentialPartners": ["string"],
      "outreachEmailDraft": "string",
      "crmPipeline": [
        {
          "partnerCategory": "string",
          "status": "string (e.g., Intro Sent, Prospecting)",
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
        console.error("outreachNode generation failed:");
        data = {
            "potentialPartners": ["Local Distributors", "Retail Chains", "Technology Providers"],
            "outreachEmailDraft": "Subject: Exploring a strategic partnership\n\nHi Team,\n\nWe are building an innovative platform and identified you as a key potential partner. Let's schedule a brief call to align on synergies.\n\nBest,\nFounder",
            "crmPipeline": [
                {"partnerCategory": "Local Distributors", "status": "Prospecting", "nextAction": "Find contact emails"},
                {"partnerCategory": "Retail Chains", "status": "Intro Pending", "nextAction": "Send intro email"}
            ]
        };
    }
    return {"execution_results": {"outreach": data}};
};