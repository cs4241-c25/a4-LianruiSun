import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Invalid login');
      } else {
        navigate('/main');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Server error occurred.');
    }
  }

  return (
    <div>
      <h1>Login</h1>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      <form onSubmit={handleLogin}>
        <label>Username: </label>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <br />
        <label>Password: </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        <button type="submit">Login</button>
      </form>

      <a href="http://34.239.106.219:3000/auth/github">Login with GitHub</a>
      <p>
        Don’t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}

export default Login;
