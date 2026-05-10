# AI-Powered Student Performance Analysis System

## Features

- **Performance Analysis Dashboard**: Next-gen UI with Recharts displaying trends and predictions.
- **AI Model Integration**: The machine learning model from the `Ai` folder is now fully integrated into the backend and frontend for real predictions.
- **Weak Student Detection**: Analyzes study hours, attendance, assignments, and previous scores to predict final outcome.
- **AI Chatbot Helper**: Placeholder API for Gemini/OpenAI integrations.
- **Smart Study Schedule**: Algorithm to create schedules based on hours and weakness.
- **AI Notes Generator**: Placeholder for automated short notes generation.
- **Authentication**: Firebase scaffold ready.

## Tech Stack
- Frontend: React (Vite) + Tailwind CSS + Recharts + Lucide Icons
- Backend: Python Flask + Scikit-Learn (with integrated model from `Ai/model`)
- Database/Auth: Firebase

## How to run locally

### The Easiest Way (Windows)
We have provided a one-click startup script. If you are inside an editor like VS Code, double-clicking it might just "open" the code. Here is how to actually run it:

**Option A: Using your File Explorer (Desktop/Folders)**
1. Open your standard Windows File Explorer and navigate to this project folder.
2. **Double-click** the `run.bat` file.
3. It will automatically open terminal windows starting both the Python backend and the React frontend.
4. Open your browser and go to `http://localhost:5173`.

**Option B: Using the Terminal (inside VS Code or Command Prompt)**
1. Open a terminal in the root directory of this project.
2. Type `.\run.bat` and press **Enter**.
3. It will launch both services automatically.
### Manual Setup
#### Frontend
1. \`cd frontend\`
2. \`npm install\`  (already done if scaffolding from IDE)
3. Create \`.env\` file:
   - \`VITE_API_BASE_URL=http://localhost:5000\`
4. \`npm run dev\`

### Backend
1. \`cd backend\`
2. \`python -m venv venv\`
3. \`source venv/bin/activate\` (Mac/Linux) or \`venv\\Scripts\\activate\` (Windows)
4. \`pip install -r requirements.txt\`
5. \`python app.py\`

### API Quick Check
- Root endpoint (Fixed 404): \`GET http://localhost:5000/\`
- Health endpoint: \`GET http://localhost:5000/api/health\`
- Prediction endpoint: \`POST http://localhost:5000/api/predict\`

## Recent Fixes
- **AI Integration**: The `Ai` folder datasets and models are now successfully connected to the React frontend via the Python backend. The frontend now passes `study_hours` explicitly for accurate model usage.
- **Backend 404 Fix**: Running the backend now returns a proper JSON root message instead of a 404 page, eliminating confusion when users open `http://localhost:5000` directly.

## Deployment Instructions

To put this project online, you need to deploy the Frontend and the Backend separately.

### 1. Deploying the Backend (Render or Heroku)
The backend is a Flask app. Render.com is highly recommended because it's free and easy to use.
1. Create a GitHub repository and push all your code.
2. Sign up on [Render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (Make sure `gunicorn` is in your `requirements.txt`).
5. Add any Environment Variables if needed (like your `GOOGLE_API_KEY`).
6. Deploy! Render will give you a live URL (e.g., `https://edutrack-api.onrender.com`).

### 2. Deploying the Frontend (Vercel)
The frontend is a Vite + React application. Vercel is the best platform for it.
1. Sign up on [Vercel](https://vercel.com) and click **Add New Project**.
2. Connect your GitHub repository.
3. In the project settings, set the **Framework Preset** to Vite.
4. Set the **Root Directory** to `frontend`.
5. Open the **Environment Variables** section and add:
   - `VITE_API_BASE_URL` = `your-render-backend-url` (e.g., `https://edutrack-api.onrender.com`).
6. Click **Deploy**. Vercel will give you a live URL for your application!

Your project is now fully online.
