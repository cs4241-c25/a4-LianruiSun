import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username || !password) {
      setErrorMsg('Username or password missing.');
      return;
    }

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg('Registration successful! Please log in.');
        navigate('/login');
      } else {
        setErrorMsg(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Error registering:', err);
      setErrorMsg('Server error occurred.');
    }
  }

  return (
    <div>
      <h1>Create a New Account</h1>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

      <form onSubmit={handleRegister}>
        <label>Username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <br />
        <label>Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <br />
        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account? <a href="/login">Log in here</a>
      </p>
    </div>
  );
}

export default Register;
