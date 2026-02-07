
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [questions, setQuestions] = useState([]);
//   const [selectedTopic, setSelectedTopic] = useState("All");

//   // HARDCODED USER ID for now (we will add login later)
//   const USER_ID = 1; 

//   // 1. Fetch data when the page loads
//   useEffect(() => {
//     // Make sure your backend is running on port 3001!
//     axios.get(`https://dsa-tracker-cuhr.onrender.com/api/questions/${USER_ID}`)
//       .then(response => {
//         setQuestions(response.data);
//       })
//       .catch(error => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);
//   const toggleQuestion = (id) => {
//     axios.post('https://dsa-tracker-cuhr.onrender.com/api/mark-complete', {
//       userId: USER_ID,
//       questionId: id
//     })
//     .then(response => {
//       setQuestions(questions.map(q => 
//         q.id === id ? { ...q, isCompleted: !q.isCompleted } : q
//       ));
//     })
//     .catch(err => console.error("Error updating status:", err));
//   };

//   // Calculate percentage for the bar
//   const calculateProgress = () => {
//     if (questions.length === 0) return 0;
//     const completedCount = questions.filter(q => q.isCompleted).length;
//     return Math.round((completedCount / questions.length) * 100);
//   };
//   const topics = ["All", ...new Set(questions.map(q => q.topic))];
  

//   return (
//     <div className="App">
//       <header className="app-header">
//         <h1>DSA Tracker</h1>
        
//         {/* Progress Bar Visual */}
//         <div className="progress-container">
//             <div 
//               className="progress-fill" 
//               style={{ width: `${calculateProgress()}%` }}
//             ></div>
//         </div>

//         <p>
//           {questions.filter(q => q.isCompleted).length} / {questions.length} Questions Solved 
//           ({calculateProgress()}%)
//         </p>
//       </header>
      
//       {/* Filter Buttons */}
//       <div className="filters">
//         {topics.map(topic => (
//           <button 
//             key={topic} 
//             className={`filter-btn ${selectedTopic === topic ? 'active' : ''}`}
//             onClick={() => setSelectedTopic(topic)}
//           >
//             {topic}
//           </button>
//         ))}
//       </div>

//       <div className="question-list">
//         {questions
//         .filter(q => selectedTopic === "All" || q.topic === selectedTopic)
//         .map((q) => (
//           <div key={q.id} className={`question-card ${q.isCompleted ? 'completed' : ''}`}>
            
//             {/* Checkbox */}
//             <div className="checkbox-container">
//                 <input 
//                 type="checkbox" 
//                 checked={!!q.isCompleted} 
//                 onChange={() => toggleQuestion(q.id)} 
//                 />
//             </div>

//             {/* Title & Link */}
//             <div className="info-container">
//                 <a href={q.link} target="_blank" rel="noreferrer" className="question-title">
//                     {q.title}
//                 </a>
//                 <span className="topic-tag">{q.topic}</span>
//             </div>

//             {/* Difficulty Badge */}
//             <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
//                 {q.difficulty}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default App;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("All");
  
  // NEW: State for the selected Sheet
  const [selectedSheet, setSelectedSheet] = useState("Striver 75");

  const [editingId, setEditingId] = useState(null);
  const [currentNote, setCurrentNote] = useState("");

  const API_BASE = "https://dsa-tracker-cuhr.onrender.com"; // Your Render URL
  const USER_ID = 1; 

  // List of Sheets you want to show
  const availableSheets = ["Striver 75", "Love Babbar 450", "NeetCode 150"];

  useEffect(() => {
    axios.get(`${API_BASE}/api/questions/${USER_ID}`)
      .then(response => {
        setQuestions(response.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const toggleQuestion = (id) => {
    axios.post(`${API_BASE}/api/mark-complete`, {
      userId: USER_ID,
      questionId: id
    })
    .then(() => {
      setQuestions(questions.map(q => 
        q.id === id ? { ...q, isCompleted: !q.isCompleted } : q
      ));
    });
  };

  const startEditing = (question) => {
    setEditingId(question.id);
    setCurrentNote(question.notes || ""); 
  };

  const saveNote = (id) => {
    axios.post(`${API_BASE}/api/save-note`, {
      userId: USER_ID,
      questionId: id,
      note: currentNote
    })
    .then(() => {
      setQuestions(questions.map(q => 
        q.id === id ? { ...q, notes: currentNote } : q
      ));
      setEditingId(null); 
    });
  };

  // --- FILTERING LOGIC ---
  // 1. Filter by Sheet first
  const sheetQuestions = questions.filter(q => q.sheet_name === selectedSheet);
  
  // 2. Then Filter by Topic (using the sheet-filtered list)
  const visibleQuestions = sheetQuestions.filter(q => selectedTopic === "All" || q.topic === selectedTopic);

  const calculateProgress = () => {
    if (sheetQuestions.length === 0) return 0;
    const completedCount = sheetQuestions.filter(q => q.isCompleted).length;
    return Math.round((completedCount / sheetQuestions.length) * 100);
  };

  // Get topics ONLY from the current sheet
  const topics = ["All", ...new Set(sheetQuestions.map(q => q.topic))];

  return (
    <div className="App">
      <header className="app-header">
        <h1>DSA Tracker</h1>
        
        {/* --- NEW: SHEET SELECTOR BUTTONS --- */}
        <div className="sheet-selector">
            {availableSheets.map(sheet => (
                <button 
                    key={sheet}
                    className={`sheet-btn ${selectedSheet === sheet ? 'active-sheet' : ''}`}
                    onClick={() => {
                        setSelectedSheet(sheet);
                        setSelectedTopic("All"); // Reset topic when switching sheets
                    }}
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
            <button 
              key={topic} 
              className={`filter-btn ${selectedTopic === topic ? 'active' : ''}`} 
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </header>
      
      <div className="question-list">
        {visibleQuestions.length === 0 ? (
            <div className="empty-state">No questions available in this sheet yet!</div>
        ) : (
            visibleQuestions.map((q) => (
            <div key={q.id} className={`question-block`}>
                <div className={`question-card ${q.isCompleted ? 'completed' : ''}`}>
                    <div className="checkbox-container">
                        <input type="checkbox" checked={!!q.isCompleted} onChange={() => toggleQuestion(q.id)} />
                    </div>
                    <div className="info-container">
                        <a href={q.link} target="_blank" rel="noreferrer" className="question-title">{q.title}</a>
                        <span className="topic-tag">{q.topic}</span>
                    </div>
                    
                    <button className="note-btn" onClick={() => startEditing(q)}>
                        {q.notes ? "📝" : "✏️"} 
                    </button>

                    <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                </div>

                {editingId === q.id && (
                    <div className="note-editor">
                        <textarea 
                            value={currentNote} 
                            onChange={(e) => setCurrentNote(e.target.value)}
                            placeholder="Write your logic..."
                        />
                        <div className="note-actions">
                            <button className="save-btn" onClick={() => saveNote(q.id)}>Save Note</button>
                            <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                    </div>
                )}
                
                {q.notes && editingId !== q.id && (
                    <div className="note-preview">
                        <strong>Note:</strong> {q.notes}
                    </div>
                )}
            </div>
            ))
        )}
      </div>
    </div>
  );
}

export default App;