import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const techOpsNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();

    const prompt = `
    You are the Technology & Operations Agent suite.
    Business Idea: ${state.business_idea}
    
    Perform analysis across these 4 domains and provide a score (1-100) and a short insight for each:
    1. execution: "Can they actually build it?" (Team skills, difficulty)
    2. tech: "Is the tech feasible right now?" (Stack, dependencies)
    3. scalability: "If it explodes, does it crash?" (Capacity planning, server load)
    4. supply_chain: "Are operations stable?" (Vendors, logistics)
    
    Output JSON MUST EXACTLY match this structure:
    {
      "execution": {"score": 1-100, "insight": "short insight"},
      "tech": {"score": 1-100, "insight": "short insight"},
      "scalability": {"score": 1-100, "insight": "short insight"},
      "supply_chain": {"score": 1-100, "insight": "short insight"}
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
        console.error("techOpsNode generation failed:", e);
        data = {
            "execution": { "score": 65, "insight": "Manageable implementation depending on team." },
            "tech": { "score": 80, "insight": "Uses standard libraries and proven methodologies." },
            "scalability": { "score": 70, "insight": "Standard cloud platforms suffice initially." },
            "supply_chain": { "score": 80, "insight": "Lightweight logistics or pure software plays are simpler." }
        };
    }
    return { "analysis": data };
};
