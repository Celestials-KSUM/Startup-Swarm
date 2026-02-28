import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateSchema } from "./state";

// Import Predictive Grouped Agents
import { marketStrategyNode } from "./predictive/market_strategy";
import { techOpsNode } from "./predictive/tech_ops";
import { riskSustainabilityNode } from "./predictive/risk_sustainability";
import { blueprintNode } from "./predictive/blueprint";

import { operationsNode } from "./execution/operations";
import { websiteBuilderNode } from "./execution/website_builder";

export const createStartupSwarm = () => {
    // Build the Graph using chaining for proper TS inference
    const builder = new StateGraph(AgentStateSchema)
        // Add Predictive Grouped Nodes
        .addNode("market_strategy", marketStrategyNode)
        .addNode("tech_ops", techOpsNode)
        .addNode("risk_sustainability", riskSustainabilityNode)
        .addNode("blueprint_node", blueprintNode)

        // Add Execution Nodes
        .addNode("operations", operationsNode)
        .addNode("website_builder", websiteBuilderNode)

        // Initial Sequential Flow instead of Parallel to avoid Groq Rate Constraints
        .addEdge(START, "market_strategy")
        .addEdge("market_strategy", "tech_ops")
        .addEdge("tech_ops", "risk_sustainability")

        // Transition to Blueprint
        .addEdge("risk_sustainability", "blueprint_node")

        // Fan-Out to Execution Nodes (2 Nodes)
        .addEdge("blueprint_node", "operations")
        .addEdge("blueprint_node", "website_builder")

        // Fan-In to END from Execution Nodes
        .addEdge("operations", END)
        .addEdge("website_builder", END);

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
