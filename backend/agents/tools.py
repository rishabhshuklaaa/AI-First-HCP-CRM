from datetime import datetime
from langchain_core.tools import tool
from database import SessionLocal
from models import Interaction

@tool
def manage_interaction_draft(
    hcp_name: str = None, 
    interaction_type: str = "In-Person", 
    date_time: str = None, 
    attendees: str = "", 
    topic_discussion: str = "", 
    material_shared: str = "", 
    sample_distributed: str = "", 
    sentiment: str = "Neutral", 
    outcome: str = "", 
    follow_up: str = ""
):
    """
    EXTRACTOR TOOL: Fill or update the form draft. 
    """
    
    if not date_time or date_time == "None":
        date_time = datetime.now().strftime("%Y-%m-%dT%H:%M")
    
    # Ensure follow_up is never "None" string or empty
    if not follow_up or follow_up.lower() == "none":
        follow_up = "Strategic follow-up will be generated based on conversation."

    # Preparing the data object
    extracted_data = {
        "hcp_name": hcp_name,
        "interaction_type": interaction_type,
        "date_time": date_time,
        "attendees": attendees,
        "topic_discussion": topic_discussion,
        "material_shared": material_shared,
        "sample_distributed": sample_distributed,
        "sentiment": sentiment,
        "outcome": outcome,
        "follow_up": follow_up
    }
    
    # Filter out None values to prevent UI errors
    clean_data = {k: v for k, v in extracted_data.items() if v is not None}
    
    return {
        "action": "UPDATE_FORM",
        "data": clean_data
    }


@tool
def search_hcp_history(hcp_name: str):
    """
    FEATURE 3: Search database for an HCP and return their FULL interaction history 
    so the AI can provide a summarized report.
    """
    db = SessionLocal()
    try:
        results = db.query(Interaction).filter(Interaction.hcp_name.ilike(f"%{hcp_name}%")).all()
        
        if not results:
            return {"action": "VIEW_DATA", "data": [], "summary_hint": "No previous records found."}
            
        data = []
        history_text = ""
        for r in results:
            entry = {
                "hcp_name": r.hcp_name,
                "interaction_type": r.interaction_type,
                "date_time": str(r.date_time),
                "topic_discussion": r.topic_discussion,
                "outcome": r.outcome,
                "sentiment": r.sentiment
            }
            data.append(entry)
            # AI ke liye ek lamba string banao summarize karne ke liye
            history_text += f"- {r.date_time}: {r.interaction_type} about {r.topic_discussion}. Outcome: {r.outcome}. Sentiment: {r.sentiment}\n"

        return {
            "action": "VIEW_DATA", 
            "data": data, 
            "context_for_ai": history_text # AI isko dekh kar summary banayega
        }
    finally:
        db.close()

@tool
def delete_interaction_record(hcp_name: str):
    """
    FEATURE 4: Delete a record from the database based on HCP name.
    """
    db = SessionLocal()
    try:
        record = db.query(Interaction).filter(Interaction.hcp_name.ilike(f"%{hcp_name}%")).first()
        if record:
            db.delete(record)
            db.commit()
            return {"action": "DELETE_SUCCESS", "hcp_name": hcp_name}
        return {"action": "DELETE_FAILED"}
    finally:
        db.close()
    
@tool
def get_all_interactions():
    """
    FEATURE 5: Fetch all interaction records from the database for a global overview.
    """
    db = SessionLocal()
    try:
        results = db.query(Interaction).order_by(Interaction.date_time.desc()).all()
        data = [
            {
                "hcp_name": r.hcp_name,
                "interaction_type": r.interaction_type,
                "topic": r.topic_discussion,
                "date": str(r.date_time),
                "sentiment": r.sentiment
            } for r in results
        ]
        return {"action": "VIEW_ALL_DATA", "data": data}
    finally:
        db.close()