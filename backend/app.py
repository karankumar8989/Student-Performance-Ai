import os
import math
import pickle
import json
import re

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import numpy as np
import pandas as pd

import google.generativeai as genai

load_dotenv()

# =========================================================
# FLASK APP SETUP
# =========================================================

app = Flask(__name__)

# FULL CORS FIX
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://student-performance-ai-karan-kumars-projects-b7999ebc.vercel.app",
            "http://localhost:5173"
        ]
    }
})
# =========================================================
# GEMINI AI CONFIGURATION
# =========================================================

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

if GEMINI_API_KEY and GEMINI_API_KEY.strip():

    try:
        print("DEBUG: GOOGLE_API_KEY found")

        genai.configure(api_key=GEMINI_API_KEY)

        model = genai.GenerativeModel("gemini-1.5-flash")

        print("DEBUG: Gemini initialized successfully")

    except Exception as e:

        print(f"Gemini Initialization Error: {e}")

        model = None

else:

    print("WARNING: GOOGLE_API_KEY missing")

    model = None

# =========================================================
# HELPER FUNCTIONS
# =========================================================

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

# =========================================================
# LOAD MODEL
# =========================================================

try:

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    model_path = os.path.join(BASE_DIR, "student_model.pkl")

    with open(model_path, "rb") as f:
        student_model = pickle.load(f)

    print("DEBUG: student_model.pkl loaded successfully")

except Exception as e:

    print(f"WARNING: Could not load student_model.pkl: {e}")

    student_model = None

# =========================================================
# HOME ROUTE
# =========================================================

@app.route("/")
def home():

    return jsonify({
        "status": "online",
        "message": "EduTrack Backend Running Successfully"
    })

# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok",
        "service": "student-performance-backend"
    })

# =========================================================
# ANALYZE STUDENT
# =========================================================

@app.route("/api/students/analyze", methods=["POST"])
def analyze_student():

    data = request.get_json(silent=True) or {}

    marks = _normalize_marks(data.get("marks", {}))

    study_hours = _to_number(data.get("study_hours", 5))
    attendance = _to_number(data.get("attendance", 0))
    assignment_score = _to_number(data.get("assignment_score", 0))

    if not marks:

        return jsonify({
            "error": "At least one valid subject mark is required."
        }), 400

    avg_marks = sum(marks.values()) / len(marks)

    pred_class = 1

    if student_model:

        try:

            ml_pred = float(
                student_model.predict([
                    [study_hours, attendance, avg_marks, assignment_score]
                ])[0]
            )

            weighted_score = (
                0.25 * (study_hours * 100 / 70)
                + 0.25 * attendance
                + 0.25 * avg_marks
                + 0.25 * assignment_score
            )

            result = (0.6 * ml_pred) + (0.4 * weighted_score)

            result = 100 / (1 + math.exp(-0.05 * (result - 50)))

            if result >= 60:
                pred_class = 2

            elif result >= 40:
                pred_class = 1

            else:
                pred_class = 0

        except Exception as e:

            print(f"Prediction Error: {e}")

    else:

        if avg_marks < 50:
            pred_class = 0

        elif avg_marks < 75:
            pred_class = 1

        else:
            pred_class = 2

    category = (
        "Weak"
        if pred_class == 0
        else "Average"
        if pred_class == 1
        else "Strong"
    )

    weak_subjects = []

    for subject, score in marks.items():

        if score < 50:

            reason = f"Low performance in {subject} (Score: {score})"

            if attendance < 60:
                reason += " and low attendance."

            elif assignment_score < 50:
                reason += " and pending assignments."

            weak_subjects.append({
                "subject": subject,
                "score": score,
                "reason": reason
            })

    improvement_plan = []

    if model and weak_subjects:

        try:

            subjects_str = ", ".join([
                w["subject"] for w in weak_subjects
            ])

            prompt = f"""
            Student is weak in:
            {subjects_str}

            Generate practical improvement tips.

            Return ONLY JSON:
            [
              {{
                "subject": "Math",
                "plan": "Study algebra daily"
              }}
            ]
            """

            response = model.generate_content(prompt)

            json_match = re.search(
                r'\[.*\]',
                response.text,
                re.DOTALL
            )

            if json_match:
                improvement_plan = json.loads(json_match.group())

        except Exception as e:

            print(f"Gemini Error: {e}")

    if not improvement_plan:

        for sub in weak_subjects:

            improvement_plan.append({
                "subject": sub["subject"],
                "plan": (
                    f"Practice {sub['subject']} daily "
                    "and revise fundamentals."
                )
            })

    return jsonify({
        "category": category,
        "avg_marks": round(avg_marks, 2),
        "weak_subjects": weak_subjects,
        "improvement_plan": improvement_plan
    })

# =========================================================
# STUDY SCHEDULE
# =========================================================

@app.route("/api/schedule", methods=["POST"])
def generate_schedule():

    data = request.get_json(silent=True) or {}

    hours = _to_number(data.get("available_hours", 2))

    weak_subjects = [
        str(subject).strip()
        for subject in data.get("weak_subjects", [])
        if str(subject).strip()
    ]

    if hours < 1:

        return jsonify({
            "error": "Minimum 1 hour required"
        }), 400

    if model:

        try:

            prompt = f"""
            Create study timetable.

            Available hours:
            {hours}

            Weak subjects:
            {', '.join(weak_subjects)}

            Return ONLY JSON.
            """

            response = model.generate_content(prompt)

            json_match = re.search(
                r'\{.*\}',
                response.text,
                re.DOTALL
            )

            if json_match:
                return jsonify(json.loads(json_match.group()))

        except Exception as e:

            print(f"Gemini Schedule Error: {e}")

    schedule = []

    session_length = 45
    break_length = 15

    total_slots = int(hours * 60 / (session_length + break_length))

    subjects = weak_subjects or ["General Revision"]

    for i in range(max(1, total_slots)):

        subject = subjects[i % len(subjects)]

        schedule.append({
            "slot": f"Session {i+1}",
            "duration": "45 min",
            "task": f"Study {subject}",
            "type": "Study"
        })

        schedule.append({
            "slot": f"Break {i+1}",
            "duration": "15 min",
            "task": "Take rest",
            "type": "Break"
        })

    return jsonify({
        "daily_timetable": schedule,
        "weekly_plan": "Practice daily and revise weekly."
    })

# =========================================================
# NOTES GENERATOR
# =========================================================

@app.route("/api/generate_notes", methods=["POST"])
def generate_notes():

    data = request.get_json(silent=True) or {}

    topic = str(data.get("topic", "General Topic")).strip()

    subject = str(data.get("subject", "General Subject")).strip()

    if model:

        try:

            prompt = f"""
            Generate short revision notes.

            Subject:
            {subject}

            Topic:
            {topic}

            Use bullet points only.
            """

            response = model.generate_content(prompt)

            notes = [
                line.strip()
                for line in response.text.split("\n")
                if line.strip()
            ]

            return jsonify({
                "subject": subject,
                "topic": topic,
                "notes": notes
            })

        except Exception as e:

            print(f"Gemini Notes Error: {e}")

    notes = [
        f"{topic} is important in {subject}.",
        "Revise core concepts regularly.",
        "Practice previous year questions.",
        "Make handwritten short notes."
    ]

    return jsonify({
        "subject": subject,
        "topic": topic,
        "notes": notes
    })

# =========================================================
# CHATBOT
# =========================================================

@app.route("/api/chatbot", methods=["POST"])
def chatbot():

    data = request.get_json(silent=True) or {}

    message = str(data.get("message", "")).strip()

    if not message:

        return jsonify({
            "reply": "Please enter your question."
        })

    if model:

        try:

            prompt = (
                "You are EduTrack AI assistant. "
                f"Answer clearly: {message}"
            )

            response = model.generate_content(prompt)

            return jsonify({
                "reply": response.text
            })

        except Exception as e:

            print(f"Gemini Chatbot Error: {e}")

    return jsonify({
        "reply": "AI service unavailable. Please try again later."
    })

# =========================================================
# PREDICT SCORE
# =========================================================

@app.route("/api/predict", methods=["POST"])
def predict_score():

    data = request.get_json(silent=True) or {}

    study_hours = _to_number(data.get("study_hours", 5))

    avg_marks = _to_number(data.get("avg_marks", 0))

    attendance = _to_number(data.get("attendance", 0))

    assignments = _to_number(data.get("assignment_score", 0))

    predicted_score = 0

    risk_of_failure = False

    if student_model:

        try:

            ml_pred = float(
                student_model.predict([
                    [study_hours, attendance, avg_marks, assignments]
                ])[0]
            )

            weighted_score = (
                0.25 * (study_hours * 100 / 70)
                + 0.25 * attendance
                + 0.25 * avg_marks
                + 0.25 * assignments
            )

            result = (0.6 * ml_pred) + (0.4 * weighted_score)

            predicted_score = 100 / (
                1 + math.exp(-0.05 * (result - 50))
            )

            risk_of_failure = predicted_score < 40

        except Exception as e:

            print(f"Prediction Error: {e}")

    else:

        predicted_score = (
            0.5 * avg_marks
            + 0.2 * attendance
            + 0.3 * assignments
        )

        risk_of_failure = predicted_score < 50

    recommendations = []

    if risk_of_failure:

        recommendations.append(
            "Attend remedial classes immediately."
        )

        recommendations.append(
            "Focus on important passing topics."
        )

    else:

        recommendations.append(
            "Maintain consistent study habits."
        )

    return jsonify({
        "predicted_final_score": round(predicted_score, 2),
        "risk_of_failure": risk_of_failure,
        "recommendations": recommendations
    })

# =========================================================
# RUN APP
# =========================================================

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )
