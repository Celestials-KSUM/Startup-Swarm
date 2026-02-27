import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def outreach_node(state: AgentState):
    llm = get_structural_llm()
    blueprint = state.get('blueprint', {})
    
    prompt = f"""
    You are the Partnership & Outreach Agent.
    Based on the following Startup Blueprint, generate an automated partnership and outreach execution plan.
    
    Startup Blueprint:
    {json.dumps(blueprint)}
    
    Your task:
    - Identify 4-5 categories of potential partners or specific types of organizations (e.g., Farming cooperatives, Distributors for AgriTech).
    - Draft a personalized, high-converting cold outreach email template meant for API/SMTP scheduling.
    - Generate an initial CRM pipeline tracking the Prospecting state and next automated actions.
    
    OUTPUT ONLY VALID JSON matching this schema:
    {{
      "potentialPartners": ["string"],
      "outreachEmailDraft": "string",
      "crmPipeline": [
        {{
          "partnerCategory": "string",
          "status": "string (e.g., Intro Sent, Prospecting)",
          "nextAction": "string"
        }}
      ]
    }}
    """
    
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception as e:
        print(f"Outreach generation failed: {e}")
        data = {
            "potentialPartners": ["Local Distributors", "Retail Chains", "Technology Providers"],
            "outreachEmailDraft": "Subject: Exploring a strategic partnership\n\nHi Team,\n\nWe are building an innovative platform and identified you as a key potential partner. Let's schedule a brief call to align on synergies.\n\nBest,\nFounder",
            "crmPipeline": [
                {"partnerCategory": "Local Distributors", "status": "Prospecting", "nextAction": "Find contact emails"},
                {"partnerCategory": "Retail Chains", "status": "Intro Pending", "nextAction": "Send intro email"}
            ]
        }
        
    return {"execution_results": {"outreach": data}}
