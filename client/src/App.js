
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
  // Inside App() function, with your other existing state variables
  const [loading, setLoading] = useState(true); // Start as true
  const [questions, setQuestions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("All");
  
  // Track which question ID is currently being edited
  const [editingId, setEditingId] = useState(null);
  // Track the text being typed in the active note box
  const [currentNote, setCurrentNote] = useState("");

  // --- CONFIGURATION ---
  // This is your LIVE Backend URL from Render
  const API_BASE = "https://dsa-tracker-cuhr.onrender.com";
  const USER_ID = 1; 

  useEffect(() => {
    axios.get(`${API_BASE}/api/questions/${USER_ID}`)
      .then(response => {
        setQuestions(response.data);
        setLoading(false); // <--- Data is here, stop loading!
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false); // Stop loading even if there is an error
      });
  }, []);

  const toggleQuestion = (id) => {
    // Mark complete in the Cloud Database
    axios.post(`${API_BASE}/api/mark-complete`, {
      userId: USER_ID,
      questionId: id
    })
    .then(() => {
      // Update local screen immediately
      setQuestions(questions.map(q => 
        q.id === id ? { ...q, isCompleted: !q.isCompleted } : q
      ));
    });
  };

  // Open the note editor for a specific question
  const startEditing = (question) => {
    setEditingId(question.id);
    setCurrentNote(question.notes || ""); // Load existing note or empty string
  };

  // Save the note to Cloud Database
  const saveNote = (id) => {
    axios.post(`${API_BASE}/api/save-note`, {
      userId: USER_ID,
      questionId: id,
      note: currentNote
    })
    .then(() => {
      // Update local state so we don't need to refresh
      setQuestions(questions.map(q => 
        q.id === id ? { ...q, notes: currentNote } : q
      ));
      setEditingId(null); // Close the editor
    });
  };

  const calculateProgress = () => {
    if (questions.length === 0) return 0;
    const completedCount = questions.filter(q => q.isCompleted).length;
    return Math.round((completedCount / questions.length) * 100);
  };

  // Get unique topics for the filter buttons
  const topics = ["All", ...new Set(questions.map(q => q.topic))];

  // If loading is true, show this instead of the main app
  if (loading) {
    return (
        <div className="App">
            <header className="app-header">
                <h1>DSA Tracker</h1>
                <p style={{ marginTop: "20px" }}>Loading your progress...</p>
            </header>
        </div>
    );
  }

  // ... rest of your code (return statement)
  return (
    <div className="App">
      <header className="app-header">
        <h1>DSA Tracker</h1>
        <div className="progress-container">
            <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
        </div>
        <p>{questions.filter(q => q.isCompleted).length} / {questions.length} Questions Solved ({calculateProgress()}%)</p>
        
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
        {questions
          .filter(q => selectedTopic === "All" || q.topic === selectedTopic)
          .map((q) => (
          <div key={q.id} className={`question-block`}>
            {/* Main Question Row */}
            <div className={`question-card ${q.isCompleted ? 'completed' : ''}`}>
                <div className="checkbox-container">
                    <input type="checkbox" checked={!!q.isCompleted} onChange={() => toggleQuestion(q.id)} />
                </div>
                <div className="info-container">
                    <a href={q.link} target="_blank" rel="noreferrer" className="question-title">{q.title}</a>
                    <span className="topic-tag">{q.topic}</span>
                </div>
                
                {/* Note Button (Pencil Icon) */}
                <button className="note-btn" onClick={() => startEditing(q)}>
                    {q.notes ? "📝" : "✏️"} 
                </button>

                <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
            </div>

            {/* Note Editor Area (Only shows if editingId matches this question) */}
            {editingId === q.id && (
                <div className="note-editor">
                    <textarea 
                        value={currentNote} 
                        onChange={(e) => setCurrentNote(e.target.value)}
                        placeholder="Write your logic, time complexity, or tricks here..."
                    />
                    <div className="note-actions">
                        <button className="save-btn" onClick={() => saveNote(q.id)}>Save Note</button>
                        <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                </div>
            )}
            
            {/* Show Saved Note Preview if it exists and we aren't editing */}
            {q.notes && editingId !== q.id && (
                <div className="note-preview">
                    <strong>Note:</strong> {q.notes}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;