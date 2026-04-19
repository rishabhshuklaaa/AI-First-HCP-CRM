from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String(255), nullable=False)
    interaction_type = Column(String(100))
    date_time = Column(DateTime)
    attendees = Column(Text)
    topic_discussion = Column(Text)
    material_shared = Column(Text)
    sample_distributed = Column(Text)
    sentiment = Column(String(50))
    outcome = Column(Text)
    follow_up = Column(Text) # AI Strategic Follow-up
    created_at = Column(DateTime, default=datetime.utcnow)