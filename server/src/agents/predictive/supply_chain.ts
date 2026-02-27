import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const supplyChainNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    
    const prompt = `
    You are the Supply Chain & Operations Agent.
    Role: "How complex and risky is the physical delivery/operations?"
    Analyze: Vendor dependency, Logistics complexity, Inventory risk (especially for Food, Hardware, Consumer Goods).
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
        console.error("supplyChainNode generation failed:");
        data = {"score": 60, "insight": "High inventory risk and complex logistics could strain early cash flow."};
    }
    return {"analysis": {"supply_chain": data}};
};