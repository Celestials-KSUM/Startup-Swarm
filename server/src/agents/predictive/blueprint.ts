import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const blueprintNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const prompt = `
    You are the Lead Startup Architect. Using the analysis from your agents, generate a complete Business Blueprint.
    Idea: ${state.business_idea}
    Scores: ${JSON.stringify(state.analysis)}
    
    OUTPUT ONLY VALID JSON matching this schema:
    {
      "businessOverview": { "name": "string", "description": "string", "targetAudience": "string", "valueProposition": "string" },
      "agentScoring": {
        "marketResearch": { "score": 0, "insight": "string" },
        "competitionIntel": { "score": 0, "insight": "string" },
        "executionRisk": { "score": 0, "insight": "string" },
        "pmfProbability": { "score": 0, "insight": "string" },
        "techFeasibility": { "score": 0, "insight": "string" },
        "fundingReadiness": { "score": 0, "insight": "string" },
        "legalCompliance": { "score": 0, "insight": "string" },
        "gtmStrategy": { "score": 0, "insight": "string" },
        "unitEconomics": { "score": 0, "insight": "string" },
        "scalabilityInfra": { "score": 0, "insight": "string" },
        "impactSustainability": { "score": 0, "insight": "string" },
        "supplyChainOps": { "score": 0, "insight": "string" },
        "dataAiRisk": { "score": 0, "insight": "string" }
      },
      "services": [ { "title": "string", "description": "string", "pricingModel": "string" } ],
      "revenueModel": ["string"],
      "costStructure": { "oneTimeSetup": ["string"], "monthlyExpenses": ["string"] },
      "strategicRoadmap": ["string"],
      "risks": ["string"],
      "growthOpportunities": ["string"]
    }
    `;
    const response = await llm.invoke([new SystemMessage({ content: prompt })]);
    let blueprint;
    try {
        let content = typeof response.content === "string" ? response.content : "";
        if (content.includes("```json")) {
            content = content.split("```json")[1].split("```")[0];
        } else if (content.includes("```")) {
            content = content.split("```")[1].split("```")[0];
        }
        blueprint = JSON.parse(content.trim());
    } catch (e) {
        console.error("Blueprint generation failed, using fallback:", e);
        const analysis = state.analysis || {};
        blueprint = {
            "businessOverview": { "name": "Fail-Safe Startup", "description": "Error in generation", "targetAudience": "Internal", "valueProposition": "Check logs" },
            "agentScoring": {
                "marketResearch": analysis.market || { "score": 0, "insight": "N/A" },
                "competitionIntel": analysis.competition || { "score": 0, "insight": "N/A" },
                "executionRisk": analysis.execution || { "score": 0, "insight": "N/A" },
                "pmfProbability": analysis.pmf || { "score": 0, "insight": "N/A" },
                "techFeasibility": analysis.tech || { "score": 0, "insight": "N/A" },
                "fundingReadiness": analysis.funding || { "score": 0, "insight": "N/A" },
                "legalCompliance": analysis.legal || { "score": 0, "insight": "N/A" },
                "gtmStrategy": analysis.gtm || { "score": 0, "insight": "N/A" },
                "unitEconomics": analysis.economics || { "score": 0, "insight": "N/A" },
                "scalabilityInfra": analysis.scalability || { "score": 0, "insight": "N/A" },
                "impactSustainability": analysis.impact || { "score": 0, "insight": "N/A" },
                "supplyChainOps": analysis.supply_chain || { "score": 0, "insight": "N/A" },
                "dataAiRisk": analysis.data_ai || { "score": 0, "insight": "N/A" }
            },
            "strategicRoadmap": ["Fix the AI generation logic"]
        };
    }
    return { blueprint };
};
