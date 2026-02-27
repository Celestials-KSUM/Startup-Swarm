import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateSchema } from "./state";

// Import Predictive Grouped Agents
import { marketStrategyNode } from "./predictive/market_strategy";
import { techOpsNode } from "./predictive/tech_ops";
import { riskSustainabilityNode } from "./predictive/risk_sustainability";
import { blueprintNode } from "./predictive/blueprint";

// Import Execution Agents
import { companyRegistrationNode } from "./execution/registration";
import { outreachNode } from "./execution/outreach";
import { investorOutreachNode } from "./execution/investor_outreach";
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
        .addNode("registration", companyRegistrationNode)
        .addNode("outreach", outreachNode)
        .addNode("investor", investorOutreachNode)
        .addNode("website_builder", websiteBuilderNode)

        // Initial Fan-Out to Predictive Groups
        .addEdge(START, "market_strategy")
        .addEdge(START, "tech_ops")
        .addEdge(START, "risk_sustainability")

        // Fan-In to Blueprint Node from Groups
        .addEdge("market_strategy", "blueprint_node")
        .addEdge("tech_ops", "blueprint_node")
        .addEdge("risk_sustainability", "blueprint_node")

        // Fan-Out to Execution Nodes
        .addEdge("blueprint_node", "registration")
        .addEdge("blueprint_node", "outreach")
        .addEdge("blueprint_node", "investor")
        .addEdge("blueprint_node", "website_builder")

        // Fan-In to END from Execution Nodes
        .addEdge("registration", END)
        .addEdge("outreach", END)
        .addEdge("investor", END)
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
