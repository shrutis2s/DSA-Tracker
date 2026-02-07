import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Login from './Login'; 

function App() {
  // --- AUTH STATE ---
  const savedUser = localStorage.getItem('dsa_user_id');
  const [userId, setUserId] = useState(savedUser ? parseInt(savedUser) : null);

  // --- DATA STATE ---
  const [questions, setQuestions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedSheet, setSelectedSheet] = useState("Striver 75");
  
  // --- UI STATE ---
  const [editingId, setEditingId] = useState(null);
  const [currentNote, setCurrentNote] = useState("");
  const [loading, setLoading] = useState(false);

  // --- CONFIG ---
  const API_BASE = "https://dsa-tracker-cuhr.onrender.com"; 
  const availableSheets = ["Striver 75", "Love Babbar 450", "NeetCode 150"];

  // --- AUTH FUNCTIONS ---
  const handleLogin = (id) => {
      setUserId(id);
      localStorage.setItem('dsa_user_id', id);
  };

  const handleLogout = () => {
      setUserId(null);
      localStorage.removeItem('dsa_user_id');
      setQuestions([]); 
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    if (userId) {
        setLoading(true);
        axios.get(`${API_BASE}/api/questions/${userId}`)
        .then(response => {
            setQuestions(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error(error);
            setLoading(false);
        });
    }
  }, [userId]);

  // --- CORE FUNCTIONS ---
  
  const toggleQuestion = (id) => {
    axios.post(`${API_BASE}/api/mark-complete`, { userId: userId, questionId: id }) 
    .then(() => {
        setQuestions(questions.map(q => q.id === id ? { ...q, isCompleted: !q.isCompleted } : q));
    });
  };

  const startEditing = (question) => {
    setEditingId(question.id);
    setCurrentNote(question.notes || ""); 
  };

  const saveNote = (id) => {
    axios.post(`${API_BASE}/api/save-note`, { userId: userId, questionId: id, note: currentNote }) 
    .then(() => {
        setQuestions(questions.map(q => q.id === id ? { ...q, notes: currentNote } : q));
        setEditingId(null);
    });
  };

  // --- FILTERING LOGIC ---
  const sheetQuestions = questions.filter(q => q.sheet_name === selectedSheet);
  const visibleQuestions = sheetQuestions.filter(q => selectedTopic === "All" || q.topic === selectedTopic);
  
  const calculateProgress = () => {
    if (sheetQuestions.length === 0) return 0;
    const completedCount = sheetQuestions.filter(q => q.isCompleted).length;
    return Math.round((completedCount / sheetQuestions.length) * 100);
  };
  
  const topics = ["All", ...new Set(sheetQuestions.map(q => q.topic))];

  // --- RENDER ---
  
  // 1. Show Login if not logged in
  if (!userId) {
      return <Login onLogin={handleLogin} />;
  }

  // 2. Show Tracker if logged in
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-top">
            <h1>DSA Tracker</h1>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        
         <div className="sheet-selector">
            {availableSheets.map(sheet => (
                <button 
                    key={sheet}
                    className={`sheet-btn ${selectedSheet === sheet ? 'active-sheet' : ''}`}
                    onClick={() => { setSelectedSheet(sheet); setSelectedTopic("All"); }}
                >
                    {sheet}
                </button>
            ))}
        </div>

        <div className="progress-container">
            <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
        </div>
        <p>{sheetQuestions.filter(q => q.isCompleted).length} / {sheetQuestions.length} Questions Solved ({calculateProgress()}%)</p>
        
        <div className="filters">
          {topics.map(topic => (
            <button key={topic} className={`filter-btn ${selectedTopic === topic ? 'active' : ''}`} onClick={() => setSelectedTopic(topic)}>{topic}</button>
          ))}
        </div>
      </header>

      <div className="question-list">
        {loading ? <p className="loading-text">Loading your progress...</p> : visibleQuestions.map((q) => (
             <div key={q.id} className={`question-block`}>
                <div className={`question-card ${q.isCompleted ? 'completed' : ''}`}>
                    <div className="checkbox-container">
                        <input type="checkbox" checked={!!q.isCompleted} onChange={() => toggleQuestion(q.id)} />
                    </div>
                    <div className="info-container">
                        <a href={q.link} target="_blank" rel="noreferrer" className="question-title">{q.title}</a>
                        <span className="topic-tag">{q.topic}</span>
                    </div>
                    <button className="note-btn" onClick={() => startEditing(q)}>{q.notes ? "📝" : "✏️"}</button>
                    <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                </div>
                
                {editingId === q.id && (
                    <div className="note-editor">
                        <textarea value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
                        <div className="note-actions">
                            <button className="save-btn" onClick={() => saveNote(q.id)}>Save</button>
                            <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                    </div>
                )}
                
                {q.notes && editingId !== q.id && <div className="note-preview"><strong>Note:</strong> {q.notes}</div>}
             </div>
        ))}
      </div>
    </div>
  );
}

export default App;