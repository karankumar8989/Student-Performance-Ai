import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Target, TrendingUp, Search, Pencil, Trash2, PlusCircle, Save } from 'lucide-react';
import { postJson } from '../api';

const STORAGE_KEY = 'edutrack_students_v1';
const defaultStudents = [
  {
    id: 'S1024',
    study_hours: 5,
    attendance: 55,
    assignment_score: 40,
    marks: { Math: 42, Physics: 48, Chemistry: 65, English: 75 },
  },
  {
    id: 'S1025',
    study_hours: 8,
    attendance: 78,
    assignment_score: 81,
    marks: { Math: 70, Physics: 68, Chemistry: 74, English: 82 },
  },
];

const Students = () => {
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore invalid local storage data.
    }
    return defaultStudents;
  });
  const [search, setSearch] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studyHours, setStudyHours] = useState(5);
  const [attendance, setAttendance] = useState(55);
  const [assignmentScore, setAssignmentScore] = useState(40);
  const [marks, setMarks] = useState({
    Math: 0,
    Physics: 0,
    Chemistry: 0,
    English: 0,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  const updateMark = (subject, value) => {
    setMarks((prev) => ({ ...prev, [subject]: Number(value) }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setStudentId('');
    setStudyHours(5);
    setAttendance(55);
    setAssignmentScore(40);
    setMarks({ Math: 0, Physics: 0, Chemistry: 0, English: 0 });
    setError('');
  };

  const saveStudent = () => {
    const trimmedId = studentId.trim();
    if (!trimmedId) {
      setError('Student ID is required.');
      return;
    }

    const payload = {
      id: trimmedId,
      study_hours: Number(studyHours),
      attendance: Number(attendance),
      assignment_score: Number(assignmentScore),
      marks: {
        Math: Number(marks.Math),
        Physics: Number(marks.Physics),
        Chemistry: Number(marks.Chemistry),
        English: Number(marks.English),
      },
    };

    if (isEditing) {
      setStudents((prev) => prev.map((student) => (student.id === trimmedId ? payload : student)));
      setError('');
      resetForm();
      return;
    }

    const exists = students.some((student) => student.id === trimmedId);
    if (exists) {
      setError('Student ID already exists. Use Edit to update it.');
      return;
    }
    setStudents((prev) => [payload, ...prev]);
    setError('');
    resetForm();
  };

  const editStudent = (student) => {
    setIsEditing(true);
    setStudentId(student.id);
    setStudyHours(student.study_hours || 5);
    setAttendance(student.attendance);
    setAssignmentScore(student.assignment_score);
    setMarks(student.marks);
  };

  const deleteStudent = (id) => {
    setStudents((prev) => prev.filter((student) => student.id !== id));
    if (analysisResult && analysisResult.student_id === id) {
      setAnalysisResult(null);
    }
  };

  const analyzeStudent = async () => {
    const trimmedId = studentId.trim();
    if (!trimmedId) {
      setError('Select or enter a student first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await postJson('/api/students/analyze', {
        student_id: trimmedId,
        marks,
        study_hours: studyHours,
        attendance,
        assignment_score: assignmentScore,
      });
      setAnalysisResult({ ...data, student_id: trimmedId });
    } catch (error) {
      setError(error.message || 'Unable to analyze student now.');
    }
    setLoading(false);
  };

  const analyzeRow = async (student) => {
    setLoading(true);
    setError('');
    try {
      const data = await postJson('/api/students/analyze', {
        student_id: student.id,
        marks: student.marks,
        study_hours: student.study_hours || 5,
        attendance: student.attendance,
        assignment_score: student.assignment_score,
      });
      setAnalysisResult({ ...data, student_id: student.id });
      editStudent(student);
    } catch (apiError) {
      setError(apiError.message || 'Unable to analyze student now.');
    }
    setLoading(false);
  };

  const filteredStudents = useMemo(
    () => students.filter((student) => student.id.toLowerCase().includes(search.toLowerCase())),
    [students, search],
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Student Management & AI Prediction</h1>
          <p className="text-foreground/60">Create, edit, delete, and analyze student performance from one manageable workspace.</p>
        </div>
        <button
          onClick={analyzeStudent}
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg hover:shadow-primary/40 transition-all flex items-center gap-2 disabled:opacity-70"
        >
          <Search size={18} />
          {loading ? 'Analyzing...' : 'Analyze Current Student'}
        </button>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Student ID</label>
          <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. S1201" className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Study Hours/Week</label>
          <input type="number" min="0" max="70" value={studyHours} onChange={(e) => setStudyHours(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Attendance (%)</label>
          <input type="number" min="0" max="100" value={attendance} onChange={(e) => setAttendance(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Assignment Score (%)</label>
          <input type="number" min="0" max="100" value={assignmentScore} onChange={(e) => setAssignmentScore(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary" />
        </div>
        {Object.keys(marks).map((subject) => (
          <div key={subject}>
            <label className="block text-sm font-medium mb-2">{subject} (%)</label>
            <input type="number" min="0" max="100" value={marks[subject]} onChange={(e) => updateMark(subject, e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary" />
          </div>
        ))}
        <div className="lg:col-span-3 flex gap-3 pt-2">
          <button
            onClick={saveStudent}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2"
          >
            {isEditing ? <Save size={16} /> : <PlusCircle size={16} />}
            {isEditing ? 'Update Student' : 'Add Student'}
          </button>
          <button
            onClick={resetForm}
            className="px-5 py-2.5 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/5"
          >
            Clear Form
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Manage Students</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student ID..."
            className="w-64 max-w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-3 pr-3">ID</th>
                <th className="py-3 pr-3">Math</th>
                <th className="py-3 pr-3">Physics</th>
                <th className="py-3 pr-3">Chemistry</th>
                <th className="py-3 pr-3">English</th>
                <th className="py-3 pr-3">Study Hours</th>
                <th className="py-3 pr-3">Attendance</th>
                <th className="py-3 pr-3">Assignments</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-border/50">
                  <td className="py-3 pr-3 font-medium">{student.id}</td>
                  <td className="py-3 pr-3">{student.marks.Math}</td>
                  <td className="py-3 pr-3">{student.marks.Physics}</td>
                  <td className="py-3 pr-3">{student.marks.Chemistry}</td>
                  <td className="py-3 pr-3">{student.marks.English}</td>
                  <td className="py-3 pr-3">{student.study_hours || 5} hrs</td>
                  <td className="py-3 pr-3">{student.attendance}%</td>
                  <td className="py-3 pr-3">{student.assignment_score}%</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => editStudent(student)}
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => analyzeRow(student)}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        Predict
                      </button>
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-foreground/60">
                    No students found for this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {analysisResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classification Result */}
          <div className="glass-card p-6 rounded-2xl border border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground/80">Classification ({analysisResult.student_id})</h3>
            <div className="flex flex-col items-center justify-center p-6 bg-black/5 dark:bg-white/5 rounded-xl border border-border">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${
                analysisResult.category === 'Weak' ? 'bg-red-500/20 text-red-500' :
                analysisResult.category === 'Average' ? 'bg-blue-500/20 text-blue-500' :
                'bg-green-500/20 text-green-500'
              }`}>
                {analysisResult.category} Student
              </span>
              <p className="mt-4 text-2xl font-bold">{analysisResult.avg_marks}% Avg Score</p>
            </div>
            
            {(analysisResult.weak_subjects.length > 0) && (
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-sm">Critical Warnings</h4>
                {analysisResult.weak_subjects.map((sub, idx) => (
                  <div key={idx} className="flex gap-3 text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{sub.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject-Wise Improvement Plan */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-border">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Target size={20} className="text-primary" />
              AI Subject-wise Improvement Plan
            </h3>
            
            <div className="space-y-4">
              {analysisResult.improvement_plan.length > 0 ? (
                analysisResult.improvement_plan.map((plan, idx) => (
                  <div key={idx} className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <h4 className="font-bold text-primary text-lg mb-2">{plan.subject}</h4>
                    <p className="text-foreground/80 text-sm leading-relaxed">{plan.plan}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-green-500/5 text-green-500 rounded-xl border border-green-500/20">
                  <TrendingUp size={32} className="mx-auto mb-3" />
                  <p className="font-medium">Student is performing well across all subjects! Keep up the good work.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center glass-card rounded-2xl border border-border border-dashed">
          <Target size={40} className="text-foreground/20 mb-4" />
          <p className="text-foreground/50">Click "Run Auto-Analysis" to scan student database for weaknesses.</p>
        </div>
      )}
    </div>
  );
};

export default Students;
