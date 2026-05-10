import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
import google.generativeai as genai
import pickle
import math
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY.strip():
    print(f"DEBUG: GOOGLE_API_KEY found (length: {len(GEMINI_API_KEY)})")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None
    print("WARNING: GOOGLE_API_KEY not found in .env file or is empty. AI features will use fallback logic.")


def _to_number(value, fallback=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(fallback)


def _normalize_marks(raw_marks):
    if not isinstance(raw_marks, dict):
        return {}
    normalized = {}
    for subject, score in raw_marks.items():
        numeric_score = _to_number(score, fallback=-1)
        if 0 <= numeric_score <= 100:
            normalized[str(subject)] = round(numeric_score, 2)
    return normalized

# --- ML Models Initialization (Enhanced & Integrated) ---
try:
    # Load the actual trained model from the Ai folder instead of synthetic data
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Ai', 'model', 'student_model.pkl')
    student_model = pickle.load(open(model_path, "rb"))
    print("DEBUG: Successfully loaded student_model.pkl from Ai folder")
except Exception as e:
    print(f"WARNING: Error loading student_model.pkl: {e}. AI predictions may fail.")
    student_model = None



# --- ENDPOINTS ---

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "message": "EduTrack Backend is running successfully. AI Models are integrated! Please visit the React frontend (usually port 5173) in your browser."
    })

@app.route('/api/students/analyze', methods=['POST'])
def analyze_student():
    """
    Step 1 & Step 2: Weak Student Detection Logic & Subject-wise Improvement System
    Input: { "student_id": "123", "marks": {"Math": 45, "Physics": 70, "Chemistry": 85}, "attendance": 75, "assignment_score": 60 }
    """
    data = request.get_json(silent=True) or {}
    marks = _normalize_marks(data.get('marks', {}))
    study_hours = _to_number(data.get('study_hours', 5))
    attendance = _to_number(data.get('attendance', 0))
    assignment_score = _to_number(data.get('assignment_score', 0))
    if not marks:
        return jsonify({"error": "At least one valid subject mark (0-100) is required."}), 400
    
    avg_marks = sum(marks.values()) / len(marks) if marks else 0
    
    # ML Classification (Integrated with Ai model)
    pred_class = 1 # default to Average
    if student_model:
        # Predict using student_model [study_hours, attendance, previous_score, assignments]
        ml_pred = float(student_model.predict([[study_hours, attendance, avg_marks, assignment_score]])[0])
        # Hybrid logic to stabilize the score
        weighted_score = (0.25 * (study_hours * 100 / 70) + 0.25 * attendance + 0.25 * avg_marks + 0.25 * assignment_score)
        result = (0.6 * ml_pred) + (0.4 * weighted_score)
        # Smooth normalization
        result = 100 / (1 + math.exp(-0.05 * (result - 50)))
        
        if result >= 60:
            pred_class = 2 # Strong
        elif result >= 40:
            pred_class = 1 # Average
        else:
            pred_class = 0 # Weak
    else:
        # Fallback logic if model is missing
        if avg_marks < 50:
            pred_class = 0
        elif avg_marks < 75:
            pred_class = 1
        else:
            pred_class = 2

    category = "Weak" if pred_class == 0 else "Average" if pred_class == 1 else "Strong"
    
    # Logic for highlighting weak subjects & reason
    weak_subjects = []
    
    for subject, score in marks.items():
        if score < 50:
            reason = f"Low performance in {subject} (Score: {score})"
            if attendance < 60:
                reason += " and low attendance."
            elif assignment_score < 50:
                reason += " and pending assignments."
            weak_subjects.append({"subject": subject, "score": score, "reason": reason})

    improvement_plan = []
    if model and weak_subjects:
        try:
            subjects_str = ", ".join([w['subject'] for w in weak_subjects])
            prompt = f"""
            A student is struggling in these subjects: {subjects_str}.
            Context: {weak_subjects}
            
            Generate a personalized improvement plan for each subject.
            Return a JSON list of objects: [{{"subject": "SubjectName", "plan": "detailed plan"}}]
            Keep the plan practical and academic-focused.
            Return ONLY the JSON.
            """
            response = model.generate_content(prompt)
            import json, re
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                improvement_plan = json.loads(json_match.group())
        except Exception as e:
            print(f"Gemini Error in Analysis: {e}")

    # Fallback if AI fails or no weak subjects
    if not improvement_plan:
        for sub in weak_subjects:
            improvement_plan.append({
                "subject": sub['subject'],
                "plan": f"Review foundational concepts in {sub['subject']}. Practice previous year questions and attend remedial sessions."
            })
            
    return jsonify({
        "category": category,
        "avg_marks": round(avg_marks, 2),
        "weak_subjects": weak_subjects,
        "improvement_plan": improvement_plan
    })


@app.route('/api/schedule', methods=['POST'])
def generate_schedule():
    """
    Step 3: Smart Study Schedule Generator (AI Enhanced)
    Input: { "available_hours": 3, "weak_subjects": ["Math", "Physics"] }
    """
    data = request.get_json(silent=True) or {}
    hours = _to_number(data.get('available_hours', 2))
    weak_subjects = [str(subject).strip() for subject in data.get('weak_subjects', []) if str(subject).strip()]
    
    if hours < 1:
        return jsonify({"error": "Minimum 1 hour required"}), 400

    if model:
        try:
            prompt = f"""
            Generate a detailed study schedule for today.
            Available Hours: {hours}
            Focus Subjects (Weak): {', '.join(weak_subjects) if weak_subjects else 'General Revision'}
            
            Return the response in JSON format (strictly) with the following structure:
            {{
                "daily_timetable": [
                    {{ "slot": "Session 1", "duration": "45 min", "task": "Task description", "type": "Study" }},
                    {{ "slot": "Break 1", "duration": "15 min", "task": "Rest", "type": "Break" }}
                ],
                "weekly_plan": "Short weekly strategy"
            }}
            Ensure the total duration fits within {hours} hours.
            """
            response = model.generate_content(prompt)
            # Find the JSON part in case there's extra text
            import json
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return jsonify(json.loads(json_match.group()))
        except Exception as e:
            print(f"Gemini Error in Schedule: {e}")

    # Fallback logic
    session_length = 45
    break_length = 15
    total_slots = int(hours * 60 / (session_length + break_length))
    schedule = []
    subjects_to_cover = weak_subjects * 2 if weak_subjects else ["General Revision"]
    subjects_to_cover += ["Strong subjects practice", "Mock Test Prep"]
    
    for i in range(max(1, total_slots)):
        subject = subjects_to_cover[i % len(subjects_to_cover)]
        schedule.append({
            "slot": f"Session {i+1}",
            "duration": f"{session_length} min",
            "task": f"Focused study on {subject}",
            "type": "Study"
        })
        schedule.append({
            "slot": f"Break {i+1}",
            "duration": f"{break_length} min",
            "task": "Rest, hydrate, walk around",
            "type": "Break"
        })
        
    return jsonify({
        "daily_timetable": schedule,
        "weekly_plan": "Mon-Wed: Core Concepts, Thu-Fri: Practice Sets, Sat: Mock Test, Sun: Rest and Light Revision (Fallback Mode)"
    })

@app.route('/api/generate_notes', methods=['POST'])
def generate_notes():
    """
    Step 4: AI Notes Generator using Gemini
    Input: { "topic": "Photosynthesis", "subject": "Biology" }
    """
    data = request.get_json(silent=True) or {}
    topic = str(data.get('topic', 'General Topic')).strip() or 'General Topic'
    subject = str(data.get('subject', 'General Subject')).strip() or 'General Subject'

    if model:
        try:
            prompt = f"""
            You are an expert academic assistant. Generate concise, high-yield revision notes for the following:
            Subject: {subject}
            Topic: {topic}
            
            Rules:
            1. Correct any spelling errors in the subject or topic silently before generating.
            2. Provide 5-7 bullet points.
            3. Each point should be clear and informative.
            4. Use markdown bolding (**) for key terms.
            5. Include one formula or a critical exam tip if applicable.
            6. Return ONLY the bullet points, no introductory text.
            """
            response = model.generate_content(prompt)
            notes = [line.strip().replace('- ', '').replace('* ', '') for line in response.text.split('\n') if line.strip()]
            return jsonify({
                "subject": subject,
                "topic": topic,
                "notes": notes
            })
        except Exception as e:
            print(f"Gemini Error: {e}")
            # Fallback below
            
    # Fallback Logic (Higher quality than before)
    notes = [
        f"**{topic}** is a core concept within the field of **{subject}**.",
        f"Key Principle: Understanding the fundamental mechanisms of {topic} is essential for {subject} mastery.",
        "System Note: AI is currently in fallback mode. Please check your GOOGLE_API_KEY in .env.",
        "Quick Revision: Focus on the major definitions and practice at least 5 related problems.",
        "Exam Strategy: Look for recurring patterns in previous years' questions regarding this topic."
    ]
    return jsonify({
        "subject": subject,
        "topic": topic,
        "notes": notes
    })


@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    Step 5: AI Chatbot Integration using Gemini
    """
    data = request.get_json(silent=True) or {}
    message = str(data.get('message', '')).strip()
    if not message:
        return jsonify({"reply": "Please type your question so I can help you."})
    
    if model:
        try:
            prompt = f"You are EduTrack AI, a helpful and friendly student assistant. Answer this query clearly and concisely: {message}"
            response = model.generate_content(prompt)
            return jsonify({"reply": response.text})
        except Exception as e:
            print(f"Gemini Error: {e}")
            
    # Fallback
    response = "I'm here to help! My AI brain is currently resting (check API key), but I can still guide you to the Study Schedule or Performance Predictor modules."
    if "doubt" in message.lower() or "explain" in message.lower():
        response = "That sounds like a great question. Typically, you should start by reviewing the basic definitions in your textbook or using our Notes Generator."
    elif "tip" in message.lower() or "study" in message.lower():
        response = "Always prioritize your weakest subjects first while your mind is fresh. Try the 50/10 study rule: 50 mins study, 10 mins break."
        
    return jsonify({
        "reply": response
    })


@app.route('/api/predict', methods=['POST'])
def predict_score():
    """
    Step 6: Performance Prediction System
    Input: { "avg_marks": 65, "attendance": 80, "assignment_score": 75 }
    """
    data = request.get_json(silent=True) or {}
    study_hours = _to_number(data.get('study_hours', 5))
    avg_marks = _to_number(data.get('avg_marks', 0))
    attendance = _to_number(data.get('attendance', 0))
    assignments = _to_number(data.get('assignment_score', 0))
    
    predicted_score = 0.0
    risk_of_failure = False
    
    if student_model:
        # Use integrated Ai folder model [study_hours, attendance, previous_score, assignments]
        ml_pred = float(student_model.predict([[study_hours, attendance, avg_marks, assignments]])[0])
        # Hybrid logic
        weighted_score = (0.25 * (study_hours * 100 / 70) + 0.25 * attendance + 0.25 * avg_marks + 0.25 * assignments)
        result = (0.6 * ml_pred) + (0.4 * weighted_score)
        predicted_score = 100 / (1 + math.exp(-0.05 * (result - 50)))
        
        risk_class = 0 if predicted_score < 40 else 1 if predicted_score < 60 else 2
        risk_of_failure = risk_class == 0
    else:
        # Fallback if model missing
        predicted_score = (0.5 * avg_marks + 0.2 * attendance + 0.3 * assignments)
        risk_of_failure = predicted_score < 50
    
    recommendation = []
    if risk_of_failure:
        recommendation.append("High priority: Attend remedial classes immediately.")
        recommendation.append("Focus solely on passing criteria topics.")
    else:
        recommendation.append("Maintain consistent practice.")
        if predicted_score > 85:
            recommendation.append("Challenge yourself with advanced problem sets.")
            
    return jsonify({
        "predicted_final_score": round(predicted_score, 2),
        "risk_of_failure": risk_of_failure,
        "recommendations": recommendation
    })


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "student-performance-backend"})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )
