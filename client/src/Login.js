import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // We will make this next

function Login({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const API_BASE = "https://dsa-tracker-cuhr.onrender.com"; // Your Render URL

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const endpoint = isRegistering ? '/api/register' : '/api/login';

        try {
            const res = await axios.post(`${API_BASE}${endpoint}`, { username, password });
            
            if (res.data.userId) {
                // Success! Pass the user ID up to App.js
                onLogin(res.data.userId);
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>{isRegistering ? "Create Account" : "Login"}</h2>
                {error && <p className="error-msg">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit">{isRegistering ? "Sign Up" : "Login"}</button>
                </form>

                <p onClick={() => setIsRegistering(!isRegistering)} className="toggle-link">
                    {isRegistering ? "Already have an account? Login" : "Need an account? Sign Up"}
                </p>
            </div>
        </div>
    );
}

export default Login;