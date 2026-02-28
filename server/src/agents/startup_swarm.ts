import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateSchema } from "./state";

// Import all Predictive Agents
import { marketStrategyNode } from "./predictive/market_strategy";
import { techOpsNode } from "./predictive/tech_ops";
import { riskSustainabilityNode } from "./predictive/risk_sustainability";
import { blueprintNode } from "./predictive/blueprint";

// Import all Execution Agents
import { operationsNode } from "./execution/operations";
import { websiteBuilderNode } from "./execution/website_builder";
import { investorOutreachNode } from "./execution/investor_outreach";
import { outreachNode } from "./execution/outreach";
import { companyRegistrationNode } from "./execution/registration";

// Wrapper nodes to run grouped agents concurrently 
const predictiveGroupNode = async (state: any) => {
    const results = await Promise.all([
        marketStrategyNode(state),
        techOpsNode(state),
        riskSustainabilityNode(state)
    ]);
    return {
        // Merge their analysis payload deeply
        analysis: Object.assign({}, ...results.map(r => r.analysis))
    };
};

const executionGroupNode = async (state: any) => {
    // Run first batch of 3 (consumes 3 distinct API keys)
    const batch1 = await Promise.all([
        operationsNode(state),
        websiteBuilderNode(state),
        investorOutreachNode(state)
    ]);

    // Run second batch of 2 (re-uses API keys without spiking single-minute limits instantly)
    const batch2 = await Promise.all([
        outreachNode(state),
        companyRegistrationNode(state)
    ]);

    const results = [...batch1, ...batch2];
    return {
        // Merge the execution_results explicitly
        execution_results: Object.assign({}, ...results.map(r => r.execution_results))
    };
};

export const createStartupSwarm = () => {
    const builder = new StateGraph(AgentStateSchema)
        .addNode("predictive_group", predictiveGroupNode)
        .addNode("blueprint_node", blueprintNode)
        .addNode("execution_group", executionGroupNode)

        .addEdge(START, "predictive_group")
        .addEdge("predictive_group", "blueprint_node")
        .addEdge("blueprint_node", "execution_group")
        .addEdge("execution_group", END);

    return builder.compile();
};

export const getDiscoveryInsight = async (businessIdea: string): Promise<string> => {
    const { getStructuralLlm } = await import("./llm");
    const { SystemMessage, HumanMessage } = await import("@langchain/core/messages");
    const llm = getStructuralLlm();

    const prompt = `You are a brilliant startup strategist. Give a 3-sentence, high-impact initial thought on this idea. Be brutally honest but highly encouraging. Idea: ${businessIdea}`;

    const res = await llm.invoke([
        new SystemMessage({ content: prompt }),
        new HumanMessage({ content: businessIdea })
    ]);
    return String(res.content);
};
