import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, BookCheck, ShieldAlert, Cpu, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { postJson } from '../api';

const STORAGE_KEY = 'edutrack_students_v1';

const StatCard = ({ title, value, subtitle, icon, color = 'primary', trendLabel }) => {
  const IconComponent = icon;
  const colorMap = {
    primary: 'bg-primary/10 text-primary border-l-primary',
    green: 'bg-green-500/10 text-green-500 border-l-green-500',
    red: 'bg-red-500/10 text-red-500 border-l-red-500',
    blue: 'bg-blue-500/10 text-blue-500 border-l-blue-500',
  };
  const iconClass = colorMap[color] || colorMap.primary;

  return (
    <div className={`glass-card p-6 rounded-2xl flex flex-col justify-between border-l-4 ${iconClass.split(' ').pop()}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-foreground/60 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconClass.split(' ').slice(0, 2).join(' ')}`}>
          <IconComponent size={24} />
        </div>
      </div>
      {trendLabel && (
        <p className="mt-4 text-xs text-foreground/50">{trendLabel}</p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState('');
  const [chartData, setChartData] = useState([]);

  // Load students from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStudents(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Compute real stats from actual students
  useEffect(() => {
    if (students.length === 0) {
      setStats(null);
      setChartData([]);
      return;
    }

    let totalAvg = 0;
    let totalAttendance = 0;
    let totalStudyHours = 0;
    let weakCount = 0;
    let totalAssignment = 0;

    students.forEach(s => {
      const marks = Object.values(s.marks || {});
      const avg = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
      totalAvg += avg;
      totalAttendance += (s.attendance || 0);
      totalStudyHours += (s.study_hours || 5);
      totalAssignment += (s.assignment_score || 0);
      if (avg < 50) weakCount++;
    });

    const overallAvg = totalAvg / students.length;
    const overallAttendance = totalAttendance / students.length;
    const overallStudyHours = totalStudyHours / students.length;
    const overallAssignment = totalAssignment / students.length;

    setStats({
      total: students.length,
      avgScore: overallAvg.toFixed(1),
      weakCount,
      avgAttendance: overallAttendance.toFixed(1),
      avgAssignment: overallAssignment.toFixed(1),
    });

    // Build chart data: each student is a data point
    const chart = students.map((s, i) => {
      const marks = Object.values(s.marks || {});
      const avg = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
      return {
        name: s.id,
        avgScore: parseFloat(avg.toFixed(1)),
        attendance: s.attendance || 0,
      };
    });
    setChartData(chart);

    // Run AI prediction based on real class average
    const runPrediction = async () => {
      try {
        const data = await postJson('/api/predict', {
          study_hours: parseFloat(overallStudyHours.toFixed(1)),
          avg_marks: parseFloat(overallAvg.toFixed(1)),
          attendance: parseFloat(overallAttendance.toFixed(1)),
          assignment_score: parseFloat(overallAssignment.toFixed(1)),
        });
        setPrediction(data);
        setPredictionError('');
      } catch (e) {
        setPredictionError(e.message || 'Backend is not reachable.');
      }
    };
    runPrediction();
  }, [students]);

  // Empty state when no students added yet
  if (students.length === 0) {
    return (
      <div className="max-w-7xl mx-auto pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h1>
          <p className="text-foreground/60">Add students to see real-time AI analytics and performance predictions.</p>
        </div>
        <div className="h-96 glass-card rounded-3xl border border-dashed border-border flex flex-col items-center justify-center gap-6 text-center px-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus size={36} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">No Students Added Yet</h2>
            <p className="text-foreground/50 max-w-md">
              Go to the <strong>Students</strong> page and add student records. 
              The dashboard will automatically calculate real performance stats, risk alerts, and AI predictions.
            </p>
          </div>
          <Link
            to="/students"
            className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:scale-105 transition-all"
          >
            Add Students Now →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h1>
          <p className="text-foreground/60">
            Live analytics based on <strong>{stats?.total}</strong> student{stats?.total !== 1 ? 's' : ''} you've added.
          </p>
        </div>
        <Link
          to="/students"
          className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-all flex items-center gap-2"
        >
          <UserPlus size={16} /> Manage Students
        </Link>
      </div>

      {/* Real Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.total ?? 0}
          icon={Users}
          color="primary"
          trendLabel="Manually added students"
        />
        <StatCard
          title="Class Avg Score"
          value={`${stats?.avgScore ?? 0}%`}
          icon={TrendingUp}
          color="green"
          trendLabel="Across all subjects"
        />
        <StatCard
          title="At-Risk Students"
          value={stats?.weakCount ?? 0}
          icon={AlertTriangle}
          color="red"
          trendLabel="Avg score below 50%"
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats?.avgAttendance ?? 0}%`}
          icon={BookCheck}
          color="blue"
          trendLabel="Across all students"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Real Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary"/>
            Student Performance Overview
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--foreground)" opacity={0.5} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--foreground)" opacity={0.5} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="avgScore" name="Avg Score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                <Area type="monotone" dataKey="attendance" name="Attendance" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAttend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Prediction Panel — based on real class data */}
        <div className="glass-card p-6 rounded-2xl border border-border flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Cpu size={20} className="text-blue-500" />
            AI Class Prediction
          </h3>

          {prediction ? (
            <div className="space-y-6 flex-1">
              <div className="p-6 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl border border-primary/20 text-center">
                <p className="text-sm font-medium mb-1">Predicted Final Exam Score</p>
                <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                  {prediction.predicted_final_score}%
                </h2>
                <p className="text-xs text-foreground/50 mt-2">Based on {stats?.total} student(s) avg</p>
              </div>

              <div className={`p-4 rounded-xl border flex items-start gap-4 ${prediction.risk_of_failure ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                {prediction.risk_of_failure ? <ShieldAlert className="text-red-500 flex-shrink-0" /> : <BookCheck className="text-green-500 flex-shrink-0" />}
                <div>
                  <h4 className={`font-bold ${prediction.risk_of_failure ? 'text-red-500' : 'text-green-500'}`}>
                    {prediction.risk_of_failure ? 'High Risk of Failure' : 'On Track for Success'}
                  </h4>
                  <p className="text-sm text-foreground/80 mt-1">Based on ML regression & classification models.</p>
                </div>
              </div>

              <div className="mt-auto">
                <h4 className="text-sm font-semibold mb-3">AI Recommendations</h4>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/80 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : predictionError ? (
            <div className="flex-1 flex items-center justify-center text-red-500 text-sm px-4 text-center">
              {predictionError}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-foreground/50 text-sm">
              Loading AI Model...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
