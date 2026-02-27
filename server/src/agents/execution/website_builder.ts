import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import Website from "../../models/website.model";
import { v4 as uuidv4 } from "uuid";

export const websiteBuilderNode = async (state: AgentState) => {
  console.log("--- WEBSITE BUILDER AGENT ---");
  const llm = getStructuralLlm();

  const businessIdea = state.business_idea;
  const blueprint = JSON.stringify(state.blueprint);

  const prompt = `You are an expert Web Designer and Copywriter. 
    Based on the following Startup Blueprint and Business Idea, generate a complete JSON configuration for a modern, high-converting one-page website.
    
    Startup Idea: ${businessIdea}
    Blueprint: ${blueprint}

    Choose the most appropriate template type from: "service", "saas", "ecommerce", "local", "corporate".

    The output MUST be a VALID JSON object with the following structure:
    {
      "template": "template_type",
      "slug": "suggested-unique-slug",
      "config": {
        "brandName": "Brand Name",
        "hero": {
          "title": "Compelling Title",
          "subtitle": "Detailed Subtitle",
          "cta": "Primary Action Text",
          "secondaryCta": "Secondary Action Text"
        },
        "features": [
          { "title": "Feature 1", "description": "Description 1", "icon": "LucideIconName" }
        ],
        "about": {
          "title": "Our Story",
          "content": "Deep copy about the mission and vision."
        },
        "testimonials": [
          { "name": "Name", "role": "Role", "content": "Review content" }
        ],
        "pricing": [
          { "plan": "Plan Name", "price": "$XX", "features": ["Feature A", "Feature B"] }
        ],
        "contact": {
          "email": "hello@brand.com",
          "address": "123 Startup St, Tech City",
          "phone": "+1 (555) 000-0000"
        },
        "theme": {
          "primaryColor": "#HEX",
          "secondaryColor": "#HEX",
          "mode": "dark" | "light"
        }
      }
    }

    Return ONLY the JSON. No preamble or explanation.`;

  const res = await llm.invoke([
    new SystemMessage({ content: prompt }),
    new HumanMessage({ content: "Generate the website configuration." })
  ]);

  const content = String(res.content).trim();
  const cleanJson = content.startsWith("```")
    ? content.replace(/^```(?:json)?\n?|\n?```$/g, "")
    : content;

  try {
    const websiteConfig = JSON.parse(cleanJson);

    // Ensure slug is unique-ish for demo
    const finalSlug = (websiteConfig.slug || "startup-" + uuidv4().slice(0, 8)).toLowerCase().replace(/\s+/g, '-');

    // Save to Database (we don't have threadId here easily unless we pass it in state, 
    // but we can use a dummy or skip saving if it's just meant to be returned in state)
    // Actually, let's just return it in the state and save it in the router handler.

    return {
      execution_results: {
        website_builder: {
          ...websiteConfig,
          slug: finalSlug,
          url: `/startup/${finalSlug}`
        }
      }
    };
  } catch (error) {
    console.error("Error parsing website config:", error);
    return {
      execution_results: {
        website_builder: {
          error: "Failed to generate website configuration"
        }
      }
    };
  }
};
