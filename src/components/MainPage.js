import React, { useState, useEffect } from 'react';

function MainPage() {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('low');
  const [tasks, setTasks] = useState([]);

  // For editing tasks
  const [editingId, setEditingId] = useState(null);
  const [editingTask, setEditingTask] = useState('');
  const [editingPriority, setEditingPriority] = useState('low');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const response = await fetch('/tasks', {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          alert('Please log in!');
          window.location.href = '/login';
          return;
        } else {
          console.error('Error fetching tasks:', response.status);
          return;
        }
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }

  async function submitTask() {
    if (!task.trim()) {
      alert('Task cannot be empty. Please enter a valid task description.');
      return;
    }

    const create_date = new Date().toISOString().split('T')[0];
    const body = {
      task,
      priority,
      create_date,
    };

    try {
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert('Task created successfully!');
        setTask('');
        setPriority('low');
        loadTasks();
      } else if (response.status === 401) {
        alert('You must be logged in to create tasks.');
        window.location.href = '/login';
      } else {
        alert('Error creating task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  }

  async function deleteTaskFn(taskId) {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        alert('Task deleted successfully!');
        loadTasks();
      } else if (response.status === 401) {
        alert('You must be logged in to delete tasks.');
        window.location.href = '/login';
      } else {
        alert('Error deleting task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }

  function startModify(t) {
    setEditingId(t._id);
    setEditingTask(t.task);
    setEditingPriority(t.priority);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTask('');
    setEditingPriority('low');
  }

  async function saveTask(taskId) {
    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          task: editingTask,
          priority: editingPriority,
        }),
      });
      if (response.ok) {
        alert('Task updated successfully!');
        setEditingId(null);
        setEditingTask('');
        setEditingPriority('low');
        loadTasks();
      } else if (response.status === 401) {
        alert('You must be logged in to modify tasks.');
        window.location.href = '/login';
      } else {
        alert('Error saving task');
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  }

  async function handleLogout() {
    const res = await fetch('/logout', {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      window.location.href = '/login';
    } else {
      alert('Logout failed!');
    }
  }

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>

      <form onSubmit={(e) => e.preventDefault()}>
        <label>Task:</label>
        <input
          type="text"
          value={task}
          placeholder="task"
          onChange={(e) => setTask(e.target.value)}
        />
        <label>Priority:</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="button" onClick={submitTask}>
          Submit
        </button>
      </form>

      <h2 id="main-heading">Results</h2>
      <div id="taskContainer">
        <ul>
          {tasks.map((t) => (
            <li key={t._id}>
              {editingId === t._id ? (
                <>
                  <input
                    type="text"
                    value={editingTask}
                    onChange={(e) => setEditingTask(e.target.value)}
                  />
                  <select
                    value={editingPriority}
                    onChange={(e) => setEditingPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button onClick={() => saveTask(t._id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <span>
                    {t.task} - {t.priority} - Deadline: {t.deadline}
                  </span>
                  <button onClick={() => deleteTaskFn(t._id)}>Delete</button>
                  <button onClick={() => startModify(t)}>Modify</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MainPage;
