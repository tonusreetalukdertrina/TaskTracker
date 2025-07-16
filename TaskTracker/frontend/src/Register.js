import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/users/register/', form);
      alert('Registered successfully');
      navigate('/');
    } catch (err) {
      alert('Error during registration');
    }
  };

  return (
    <div className="register-container">
  <div className="register-box">
    <h1>Task Tracker</h1>
    <h2>Register</h2>
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <button type="submit">Register</button>
      <h3>Already Have An Account?</h3>
      <button onClick={() => navigate('/')}>Login</button>
    </form>
  </div>
</div>
  );
};

export default Register;
