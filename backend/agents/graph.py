import os
from datetime import datetime  
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_groq import ChatGroq
from agents.tools import (
    manage_interaction_draft,  
    search_hcp_history,        
    delete_interaction_record  
)
from langgraph.prebuilt import ToolNode
from dotenv import load_dotenv

load_dotenv()

# State management
class State(TypedDict):
    messages: Annotated[list, add_messages]

# 1. Initialize LLM
llm = ChatGroq(
    temperature=0, 
    model_name="llama-3.3-70b-versatile", 
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# 2. Updated Tools list
tools = [
    manage_interaction_draft, 
    search_hcp_history, 
    delete_interaction_record
]

# 3. Bind tools to LLM
llm_with_tools = llm.bind_tools(tools)

# 4. Chatbot Node
def chatbot(state: State):
    # Dynamic System Prompt with Current Date
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    system_prompt = (
    f"You are a Senior CRM Strategy Agent. Your mission: assistance in logging and analyzing HCP interactions.\n\n"
    f"CRITICAL INSTRUCTIONS:\n"
    f"1. DATE: Today is {current_date}. Always use YYYY-MM-DDTHH:MM format. Never return 'None'.\n\n"
    f"2. FOLLOW-UP STRUCTURE: You MUST return follow-ups in this EXACT bulleted format for the UI:\n"
    "   • ACTION: [Short immediate task]\n"
    "   • STRATEGY: [Long-term goal for this HCP]\n"
    "   • TIMELINE: [Specific deadline]\n\n"
    f"3. SELECTIVE INTELLIGENCE:\n"
    "   - If user asks for a specific HCP: Use 'search_hcp_history' and provide an 'In-Short' summary of their past behavior.\n"
    "   - If user asks for 'all doctors', 'list', or 'everyone': Use 'get_all_interactions' to show the master table.\n\n"
    "4. PERSISTENCE: Maintain form data during edits unless explicitly changed."
)
    
    messages = [("system", system_prompt)] + state["messages"]
    return {"messages": [llm_with_tools.invoke(messages)]}

# 5. Graph Structure Setup
builder = StateGraph(State)

builder.add_node("chatbot", chatbot)
builder.add_node("tools", ToolNode(tools))

def route_tools(state: State):
    if state["messages"][-1].tool_calls:
        return "tools"
    return END

builder.add_edge("__start__", "chatbot")
builder.add_conditional_edges("chatbot", route_tools)
builder.add_edge("tools", "chatbot")

# Final Compile
react_graph = builder.compile()