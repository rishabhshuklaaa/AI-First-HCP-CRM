from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from agents.graph import react_graph
from database import SessionLocal
from models import Interaction
from typing import Optional
from datetime import datetime

app = FastAPI(title="HCP AI CRM API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class InteractionSchema(BaseModel):
    hcp_name: str
    interaction_type: str
    date_time: str
    attendees: Optional[str] = ""
    topic_discussion: Optional[str] = ""
    material_shared: Optional[str] = ""
    sample_distributed: Optional[str] = ""
    sentiment: str
    outcome: Optional[str] = ""
    follow_up: Optional[str] = ""

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        inputs = {"messages": [("user", request.message)]}
        result = react_graph.invoke(inputs)
        
        ai_message = result["messages"][-1].content
        
        action_data = {}
        for msg in reversed(result["messages"]):
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                tool_call = msg.tool_calls[0]
                action_data = tool_call['args']
                break

        return {
            "response": ai_message,
            "action": action_data.get("action", "UPDATE_FORM") if action_data else "CHAT",
            "data": action_data.get("data", action_data) 
        }
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/interactions")
def get_interactions():
    db = SessionLocal()
    interactions = db.query(Interaction).order_by(Interaction.id.desc()).all()
    db.close()
    return interactions

@app.post("/interactions/commit")
async def commit_interaction(data: InteractionSchema):
    db = SessionLocal()
    try:
        interaction_dict = data.model_dump()
        
        if interaction_dict.get("date_time"):
            try:
                # Robust Parsing: 'T' handle karna aur sirf Minutes tak ka data lena
                raw_date = interaction_dict["date_time"].replace('T', ' ')
                # Agar seconds aa rahe hain (e.g. 12:00:00), toh unhe slice kardo
                clean_date = raw_date[:16] 
                interaction_dict["date_time"] = datetime.strptime(clean_date, "%Y-%m-%d %H:%M")
            except Exception as ve:
                print(f"Date Parsing Error: {ve}")
                # Fallback: Agar parsing fail ho, toh current time save kardo
                interaction_dict["date_time"] = datetime.now()

        new_record = Interaction(**interaction_dict)
        db.add(new_record)
        db.commit()
        return {"status": "SUCCESS"}
    except Exception as e:
        db.rollback()
        print(f"DATABASE ERROR: {e}")
        return {"status": "ERROR", "message": str(e)}
    finally:
        db.close()

# uvicorn main:app --reload