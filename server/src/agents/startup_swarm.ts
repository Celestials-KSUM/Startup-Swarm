import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateSchema } from "./state";

// Import Predictive Agents
import { marketResearchNode } from "./predictive/market_research";
import { competitionIntelNode } from "./predictive/competition_intel";
import { executionRiskNode } from "./predictive/execution_risk";
import { pmfNode } from "./predictive/pmf";
import { techFeasibilityNode } from "./predictive/tech_feasibility";
import { fundingNode } from "./predictive/funding";
import { legalNode } from "./predictive/legal";
import { gtmNode } from "./predictive/gtm";
import { economicsNode } from "./predictive/economics";
import { scalabilityNode } from "./predictive/scalability";
import { impactNode } from "./predictive/impact";
import { supplyChainNode } from "./predictive/supply_chain";
import { dataAiNode } from "./predictive/data_ai";
import { blueprintNode } from "./predictive/blueprint";

// Import Execution Agents
import { companyRegistrationNode } from "./execution/registration";
import { outreachNode } from "./execution/outreach";
import { investorOutreachNode } from "./execution/investor_outreach";

export const createStartupSwarm = () => {
    // Build the Graph using chaining for proper TS inference
    const builder = new StateGraph(AgentStateSchema)
        // Add Predictive Nodes
        .addNode("market", marketResearchNode)
        .addNode("competition", competitionIntelNode)
        .addNode("execution", executionRiskNode)
        .addNode("pmf", pmfNode)
        .addNode("tech", techFeasibilityNode)
        .addNode("funding", fundingNode)
        .addNode("legal", legalNode)
        .addNode("gtm", gtmNode)
        .addNode("economics", economicsNode)
        .addNode("scalability", scalabilityNode)
        .addNode("impact", impactNode)
        .addNode("supply_chain", supplyChainNode)
        .addNode("data_ai", dataAiNode)
        .addNode("blueprint_node", blueprintNode)

        // Add Execution Nodes
        .addNode("registration", companyRegistrationNode)
        .addNode("outreach", outreachNode)
        .addNode("investor", investorOutreachNode)

        // Initial Fan-Out to Predictive Nodes
        .addEdge(START, "market")
        .addEdge(START, "competition")
        .addEdge(START, "execution")
        .addEdge(START, "pmf")
        .addEdge(START, "tech")
        .addEdge(START, "funding")
        .addEdge(START, "legal")
        .addEdge(START, "gtm")
        .addEdge(START, "economics")
        .addEdge(START, "scalability")
        .addEdge(START, "impact")
        .addEdge(START, "supply_chain")
        .addEdge(START, "data_ai")

        // Fan-In to Blueprint Node
        .addEdge("market", "blueprint_node")
        .addEdge("competition", "blueprint_node")
        .addEdge("execution", "blueprint_node")
        .addEdge("pmf", "blueprint_node")
        .addEdge("tech", "blueprint_node")
        .addEdge("funding", "blueprint_node")
        .addEdge("legal", "blueprint_node")
        .addEdge("gtm", "blueprint_node")
        .addEdge("economics", "blueprint_node")
        .addEdge("scalability", "blueprint_node")
        .addEdge("impact", "blueprint_node")
        .addEdge("supply_chain", "blueprint_node")
        .addEdge("data_ai", "blueprint_node")

        // Fan-Out to Execution Nodes
        .addEdge("blueprint_node", "registration")
        .addEdge("blueprint_node", "outreach")
        .addEdge("blueprint_node", "investor")

        // Fan-In to END from Execution Nodes
        .addEdge("registration", END)
        .addEdge("outreach", END)
        .addEdge("investor", END);

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
