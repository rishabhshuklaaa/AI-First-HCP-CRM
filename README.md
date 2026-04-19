# AI-First HCP Interaction Manager (CRM Module)

An intelligent, AI-driven CRM system designed for Healthcare Professionals (HCPs). This module allows field representatives to log, edit, and analyze interactions using an "AI-First" approach, powered by LangGraph and Groq.

## 🌟 Key Features
- **Dual Interaction Modes:** Log data via a structured manual form or a natural conversational chat interface.
- **Agentic AI Workflow:** Built with **LangGraph**, the system intelligently decides which tool to trigger based on user intent.
- **Smart Entity Extraction:** Automatically extracts HCP names, topics, and sentiments from raw chat text.
- **Conversational CRUD:** Complete database control (Create, Read, Update, Delete) using natural language prompts.
- **Strategic Follow-up Engine:** Analyzes logs to suggest a strategic follow-up timeline and next actions.

## 🛠️ Tech Stack
- **Frontend:** React.js, Redux Toolkit, Tailwind CSS
- **Backend:** FastAPI (Python)
- **AI Agent:** LangGraph, LangChain
- **LLM:** Groq (LPU Inference Engine)
- **Database:** PostgreSQL
- **Font:** Google Inter

## 🚀 LangGraph Tools Implemented
1. **log_interaction:** Extracts entities from chat and structures HCP data into the database.
2. **edit_interaction:** Modifies existing records via natural language commands.
3. **search_hcp_history:** Fetches specific historical insights for a better context.
4. **get_all_interactions:** Generates the complete interaction registry and renders it as a structured table.
5. **delete_interaction:** Identifies and securely deletes records based on conversational context.
6. **generate_followup_strategy:** (Unique) Analyzes interaction depth to create a strategic follow-up timeline.

## ⚙️ Installation & Setup

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate`  # On Windows use `.\venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

---
Developed by **Rishabh Shukla** | 2026