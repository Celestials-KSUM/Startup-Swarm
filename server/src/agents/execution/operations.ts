import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const operationsNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const blueprint = state.blueprint || {};
    const prompt = `
    You are the Startup Operations Automation Agent.
    Based on the following Startup Blueprint, generate an execution plan containing company registration, partnership outreach, and investor outreach strategies.
    
    Startup Blueprint:
    ${JSON.stringify(blueprint)}
    
    Your task:
    1. Prepare registration documents, government forms, and draft an email to schedule a CA/Lawyer.
    2. Identify potential partner types and draft an outreach email, plus a CRM pipeline.
    3. Identify target investors, funding stage, draft a pitch email, plus a CRM pipeline.
    
    OUTPUT ONLY VALID JSON matching this exact schema:
    {
      "registration": {
        "documentsRequired": ["string"],
        "incorporationChecklist": ["string"],
        "governmentFormsNeeded": ["string"],
        "caAppointmentDraft": "string"
      },
      "outreach": {
        "potentialPartners": ["string"],
        "outreachEmailDraft": "string",
        "crmPipeline": [ { "partnerCategory": "string", "status": "string", "nextAction": "string" } ]
      },
      "investorOutreach": {
        "investorTargets": ["string"],
        "recommendedStage": "string",
        "pitchEmailDraft": "string",
        "crmPipeline": [ { "investorType": "string", "status": "string", "nextAction": "string" } ]
      }
    }
    `;

    const response = await llm.invoke([new SystemMessage({ content: prompt })]);
    let content = typeof response.content === "string" ? response.content : "";
    let data;
    try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            data = JSON.parse(match[0]);
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("operationsNode generation failed:", e);
        data = {
            "registration": { "documentsRequired": [], "incorporationChecklist": [], "governmentFormsNeeded": [], "caAppointmentDraft": "" },
            "outreach": { "potentialPartners": [], "outreachEmailDraft": "", "crmPipeline": [] },
            "investorOutreach": { "investorTargets": [], "recommendedStage": "", "pitchEmailDraft": "", "crmPipeline": [] }
        };
    }
    return { "execution_results": data };
};
