import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Dashboard = () => {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: 'Incomplete',
    due_date: '',
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/tasks/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      // Sort by position for correct ordering
      setTasks(res.data.sort((a, b) => a.position - b.position));
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/tasks/', task, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      if (res.status === 201 || res.status === 200) {
        setTask({ title: '', description: '', status: 'Incomplete', due_date: '' });
        setShowForm(false);
        fetchTasks();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/tasks/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh');
    try {
      await axios.post('http://localhost:8000/api/users/logout/', { refresh }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      });
    } catch {}
    localStorage.clear();
    navigate('/');
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/tasks/${taskId}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      fetchTasks();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    // Get only the tasks visible in current filter
    const visibleTasks = tasks.filter(
      (t) => filterStatus === 'All' || t.status === filterStatus
    );

    const reorderedVisible = Array.from(visibleTasks);
    const [moved] = reorderedVisible.splice(result.source.index, 1);
    reorderedVisible.splice(result.destination.index, 0, moved);

    // Now update global tasks based on new visible task order
    const updatedTasks = [...tasks];
    let visibleIndex = 0;
    for (let i = 0; i < updatedTasks.length; i++) {
      if (filterStatus === 'All' || updatedTasks[i].status === filterStatus) {
        updatedTasks[i] = reorderedVisible[visibleIndex];
        visibleIndex++;
      }
    }

    setTasks(updatedTasks);

    try {
      await axios.post(
        'http://localhost:8000/api/tasks/reorder/',
        { order: updatedTasks.map((t) => t.id) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        }
      );
    } catch (err) {
      console.error('Error saving order:', err);
    }
  };

  const visibleTasks = tasks.filter(
    (t) => filterStatus === 'All' || t.status === filterStatus
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
        <h2>Task Tracker</h2>
        <div>
          <button onClick={() => setShowForm(!showForm)} style={{ marginRight: '10px' }}>
            {showForm ? 'Cancel' : 'Add Task'}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ margin: '1rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '6px' }}>
          <input name="title" placeholder="Title" value={task.title} onChange={handleChange} required />
          <textarea name="description" placeholder="Description" value={task.description} onChange={handleChange} required />
          <select name="status" value={task.status} onChange={handleChange}>
            <option value="Incomplete">Incomplete</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
          <input type="date" name="due_date" value={task.due_date} onChange={handleChange} required />
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Task'}</button>
        </form>
      )}

      <div style={{ margin: '1rem' }}>
        <h3>Task List</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginRight: '10px' }}>Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="All">All</option>
            <option value="Incomplete">Incomplete</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="taskList">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} style={{ listStyle: 'none', padding: 0 }}>
                {visibleTasks.map((t, index) => (
                  <Draggable key={t.id} draggableId={t.id.toString()} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid #ccc',
                          padding: '10px',
                          borderRadius: '6px',
                          marginBottom: '10px',
                          background: '#fff',
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div>
                          <strong>{t.title}</strong><br />
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                            <select
                              value={t.status}
                              onChange={(e) => handleStatusChange(t.id, e.target.value)}
                              style={{ marginRight: '1rem' }}
                            >
                              <option value="Incomplete">Incomplete</option>
                              <option value="Upcoming">Upcoming</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <span>Due: {t.due_date}</span>
                          </div>
                        </div>
                        <div>
                          <button onClick={() => navigate(`/task/${t.id}`)} style={{ marginRight: '8px' }}>View</button>
                          <button onClick={() => handleDelete(t.id)}>Delete</button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Dashboard;
