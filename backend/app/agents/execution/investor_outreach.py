import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def investor_outreach_node(state: AgentState):
    llm = get_structural_llm()
    # Pull the predictive blueprint back into the LLM context
    blueprint = state.get('blueprint', {})
    
    prompt = f"""
    You are the Investor Outreach Automation Agent.
    Based on the following Startup Blueprint, generate an automated investor fundraising execution plan.
    
    Startup Blueprint:
    {json.dumps(blueprint)}
    
    Your task:
    - Identify 3 relevant investor types/sectors (e.g., specific VC tags, Angel syndicates).
    - Determine the suitable stage (e.g., Pre-seed, Seed).
    - Draft a custom, personalized pitch email meant for an initial intro.
    - Generate an initial CRM tracking pipeline for sending intros, tracking open rates, and follow-ups.
    
    OUTPUT ONLY VALID JSON matching this schema:
    {{
      "investorTargets": ["string"],
      "recommendedStage": "string",
      "pitchEmailDraft": "string",
      "crmPipeline": [
        {{
          "investorType": "string",
          "status": "string (e.g., Intro Pending, Follow-up Scheduled)",
          "nextAction": "string"
        }}
      ]
    }}
    """
    
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception as e:
        print(f"Investor Outreach generation failed: {e}")
        data = {
            "investorTargets": ["Seed VCs focused on tech", "Angel Investors network", "Strategic Corporate Investors"],
            "recommendedStage": "Pre-Seed",
            "pitchEmailDraft": "Subject: Innovative startup in your space\n\nHi [Investor Name],\n\nI noticed your recent investments and I wanted to share what we're building. We have a compelling solution and I would love to grab a brief 10 min call to explore if it aligns with your mandate.\n\nBest,\nFounder",
            "crmPipeline": [
                {"investorType": "Top Tier VC", "status": "Intro Pending", "nextAction": "Send email and track open rate"},
                {"investorType": "Angel Syndicate", "status": "Prospecting", "nextAction": "Find warm intro"}
            ]
        }
        
    return {"execution_results": {"investorOutreach": data}}
