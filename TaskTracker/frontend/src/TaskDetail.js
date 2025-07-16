import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/tasks/${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    }).then(res => setTask(res.data));
  }, [id]);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    await axios.put(`http://localhost:8000/api/tasks/${id}/`, task, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    });
    setEditMode(false);
    alert('Updated');
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      await axios.delete(`http://localhost:8000/api/tasks/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
      });
      navigate('/dashboard');
    }
  };

  if (!task) return <div>Loading...</div>;

  return (
    <div>
      <div className="navbar">
        <h2>Task Detail</h2>
        <button className="btn red" onClick={() => navigate('/dashboard')}>Home</button>
      </div>

      <div className="task-form">
        {editMode ? (
          <>
            <input name="title" value={task.title} onChange={handleChange} />
            <textarea name="description" value={task.description} onChange={handleChange} />
            <select name="status" value={task.status} onChange={handleChange}>
              <option>Incomplete</option>
              <option>Upcoming</option>
              <option>Completed</option>
            </select>
            <input type="date" name="due_date" value={task.due_date} onChange={handleChange} />
            <button className="btn green" onClick={handleUpdate}>Save</button>
            <button className="btn" onClick={() => setEditMode(false)}>Cancel</button>
          </>
        ) : (
          <>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <p>Due Date: {task.due_date}</p>
            <button className="btn blue" onClick={() => setEditMode(true)}>Edit</button>
            <button className="btn red" onClick={handleDelete}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
