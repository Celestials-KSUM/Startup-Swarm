import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const companyRegistrationNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const blueprint = state.blueprint || {};
    const prompt = `
    You are the Company Registration Assistant Agent.
    Based on the following Startup Blueprint, generate an automated company registration action plan.
    
    Startup Blueprint:
    ${JSON.stringify(blueprint)}
    
    Your task:
    - Prepare a required documents list
    - Generate an incorporation checklist
    - Predict necessary government forms (e.g., SPICe+ for India, Stripe Atlas for US, etc. depending on target audience/location)
    - Draft an email to Schedule a CA/Lawyer appointment
    
    OUTPUT ONLY VALID JSON matching this schema:
    {
      "documentsRequired": ["string"],
      "incorporationChecklist": ["string"],
      "governmentFormsNeeded": ["string"],
      "caAppointmentDraft": "string"
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
        console.error("companyRegistrationNode generation failed:");
        data = {
            "documentsRequired": ["Director ID (DIN)", "Address Proof", "PAN/Aadhar"],
            "incorporationChecklist": ["Digital Signature Certificate (DSC)", "Name Approval (RUN)", "File SPICe+"],
            "governmentFormsNeeded": ["SPICe+ Part A", "SPICe+ Part B", "AGILE-PRO-S"],
            "caAppointmentDraft": "Subject: Inquiry for Company Incorporation\n\nHi,\n\nI need assistance registering my new startup..."
        };
    }
    return {"execution_results": {"registration": data}};
};