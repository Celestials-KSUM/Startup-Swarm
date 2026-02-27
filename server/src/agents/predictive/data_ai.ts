import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as http from "https";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

// HuggingFace Model Search Tool (Open-Source AI Dependency)
const huggingFaceModelSearchTool = tool(
    async ({ query }) => {
        try {
            const response = await fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=5`);
            if (!response.ok) return "Failed to fetch from HuggingFace.";
            const data = await response.json();
            const results = data.map((r: any) => `Model: ${r.id}\nDownloads: ${r.downloads}`).join("\n\n");
            return results || "No related HuggingFace models found. Proprietary data might be a strong moat here.";
        } catch (e: any) {
            return "Error calling HuggingFace: " + e.message;
        }
    },
    {
        name: "huggingface_model_search",
        description: "Search HuggingFace for existing AI models (open-source) to evaluate AI defensibility and dependency on proprietary data vs publicly available models. If many models exist, defensibility is lower.",
        schema: z.object({
            query: z.string().describe("The AI model task or architecture to search for (e.g., 'text generation', 'medical imaging').")
        })
    }
);

// Arxiv Paper Search Tool
const arxivPaperSearchTool = tool(
    async ({ query }) => {
        try {
            const response = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=3`);
            if (!response.ok) return "Failed to fetch from Arxiv.";
            const text = await response.text();
            // Regex parse for titles (Arxiv returns XML)
            const titles = [...text.matchAll(/<title>([^<]+)<\/title>/g)].slice(1, 4).map(m => m[1].replace(/\n/g, "").trim());
            return titles.length > 0 ? "Published research papers on this topic:\n" + titles.join("\n") : "No related Arxiv papers found.";
        } catch (e: any) {
            return "Error calling Arxiv: " + e.message;
        }
    },
    {
        name: "arxiv_paper_search",
        description: "Search Arxiv for recent research papers to evaluate cutting-edge AI feasibility and defensibility. Helpful to see if a method is already widely published and commoditized.",
        schema: z.object({
            query: z.string().describe("The technical or AI concept to search for (e.g., 'RAG', 'protein folding').")
        })
    }
);

export const dataAiNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    const tools = [huggingFaceModelSearchTool, arxivPaperSearchTool];
    const llmWithTools = (llm as any).bindTools(tools);

    const prompt = `
    You are the Data & AI Risk Agent.
    Role: "How defensible and reliable is the AI/Data moat?"
    Analyze: Model dependency, Data acquisition difficulty, Bias & reliability risks (Relevant for AI startups).
    Business Idea: ${state.business_idea}
    
    You have tools to research the AI moats (HuggingFace Model Search, Arxiv Paper Search).
    Use them to check how commoditized the core technology is. If open source models are highly downloaded, the data moat might be weak.
    
    After gathering data (or immediately if you don't need tools), output YOUR FINAL ANALYSIS as strictly valid JSON matching this schema:
    {"score": 1-100, "insight": "short insight"}
    Do not output any additional text outside the JSON.
    `;

    let messages: any[] = [new SystemMessage({ content: prompt })];
    let data;

    try {
        let response = await llmWithTools.invoke(messages);
        messages.push(response);

        let iterations = 0;
        // Check for tool calls
        while (response.tool_calls && response.tool_calls.length > 0 && iterations < 3) {
            for (const toolCall of response.tool_calls) {
                if (toolCall.name === "huggingface_model_search") {
                    const result = await huggingFaceModelSearchTool.invoke(toolCall.args);
                    const shortResult = typeof result === "string" ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: shortResult, name: toolCall.name }));
                } else if (toolCall.name === "arxiv_paper_search") {
                    const result = await arxivPaperSearchTool.invoke(toolCall.args);
                    messages.push(new ToolMessage({ tool_call_id: toolCall.id, content: String(result), name: toolCall.name }));
                }
            }
            response = await llmWithTools.invoke(messages);
            messages.push(response);
            iterations++;
        }

        let content = typeof response.content === "string" ? response.content : "";
        content = content.replace(/```json/g, "").replace(/```/g, "").trim();
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            data = JSON.parse(match[0]);
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("dataAiNode generation failed:", e);
        data = { "score": 70, "insight": "Proprietary data acquisition is difficult, increasing dependency on foundational models." };
    }
    return { "analysis": { "data_ai": data } };
};