import json
import re
from langchain_core.messages import SystemMessage
from app.agents.state import AgentState
from app.agents.llm import get_structural_llm

def company_registration_node(state: AgentState):
    llm = get_structural_llm()
    # Pull the blueprint we just generated to contextualize the execution plan
    blueprint = state.get('blueprint', {})
    
    prompt = f"""
    You are the Company Registration Assistant Agent.
    Based on the following Startup Blueprint, generate an automated company registration action plan.
    
    Startup Blueprint:
    {json.dumps(blueprint)}
    
    Your task:
    - Prepare a required documents list
    - Generate an incorporation checklist
    - Predict necessary government forms (e.g., SPICe+ for India, Stripe Atlas for US, etc. depending on target audience/location)
    - Draft an email to Schedule a CA/Lawyer appointment
    
    OUTPUT ONLY VALID JSON matching this schema:
    {{
      "documentsRequired": ["string"],
      "incorporationChecklist": ["string"],
      "governmentFormsNeeded": ["string"],
      "caAppointmentDraft": "string"
    }}
    """
    
    response = llm.invoke([SystemMessage(content=prompt)])
    try:
        data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
    except Exception as e:
        print(f"Company Registration breakdown failed: {e}")
        data = {
            "documentsRequired": ["Director ID (DIN)", "Address Proof", "PAN/Aadhar"],
            "incorporationChecklist": ["Digital Signature Certificate (DSC)", "Name Approval (RUN)", "File SPICe+"],
            "governmentFormsNeeded": ["SPICe+ Part A", "SPICe+ Part B", "AGILE-PRO-S"],
            "caAppointmentDraft": "Subject: Inquiry for Company Incorporation\n\nHi,\n\nI need assistance registering my new startup..."
        }
        
    return {"execution_results": {"registration": data}}
