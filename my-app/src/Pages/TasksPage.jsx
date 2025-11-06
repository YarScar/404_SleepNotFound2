import React, { useState, useEffect } from "react";
import "../Styles/Pages.css";

export default function TasksPage() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem("tasks_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ subject: "", description: "" });

  useEffect(() => {
    try {
      localStorage.setItem("tasks_v1", JSON.stringify(tasks));
    } catch (e) {
      // ignore storage errors
    }
  }, [tasks]);

  function toggleDone(id) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addTask(e) {
    e.preventDefault();
    const subject = newSubject.trim();
    if (!subject) return;
    const next = {
      id: Date.now(),
      subject,
      description: newDescription.trim(),
      done: false,
    };
    setTasks(prev => [next, ...prev]);
    setNewSubject("");
    setNewDescription("");
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditValues({ subject: task.subject, description: task.description || "" });
  }

  function saveEdit(id) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, subject: editValues.subject.trim() || t.subject, description: editValues.description } : t)));
    setEditingId(null);
    setEditValues({ subject: "", description: "" });
  }

  return (
    <div className="page tasks-page">
      <div className="hero-section tasks-hero">
        <div className="tasks-icon profile-icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6h8M8 12h8M8 18h8" />
          </svg>
        </div>
        <h1 className="app-title tasks-title">Tasks</h1>
        <p className="tagline tasks-subtitle">Keep focused — same aesthetic across the app.</p>
      </div>

      <section className="recent-tasks">
        <h2 className="recent-tasks-title">My Tasks</h2>

        <form onSubmit={addTask} className="tasks-form" aria-label="Add task form">
          <input
            className="tasks-input"
            placeholder="Task"
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            aria-label="Task subject"
          />
          <input
            className="tasks-input description"
            placeholder="Short description (optional)"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            aria-label="Task description"
          />
          <div className="tasks-form-actions">
            <button type="submit" className="tasks-add-button" aria-label="Add task">
              Add
            </button>
          </div>
        </form>

        <div className="tasks-list" aria-live="polite">
          {tasks.length === 0 && <p className="tasks-empty-message">No tasks yet — add one above.</p>}

          {tasks.map(task => (
            <div key={task.id} className="task-item">
              <div
                className={`checkbox ${task.done ? "checked" : ""}`}
                onClick={() => toggleDone(task.id)}
                role="button"
                aria-pressed={task.done}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleDone(task.id); }}
                title={task.done ? "Mark as undone" : "Mark as done"}
              >
                {task.done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                )}
              </div>

              <div className="task-content">
                {editingId === task.id ? (
                  <>
                    <input
                      className="task-edit-input-subject"
                      value={editValues.subject}
                      onChange={e => setEditValues(ev => ({ ...ev, subject: e.target.value }))}
                      aria-label="Edit task subject"
                    />
                    <input
                      className="task-edit-input-description"
                      value={editValues.description}
                      onChange={e => setEditValues(ev => ({ ...ev, description: e.target.value }))}
                      aria-label="Edit task description"
                    />
                  </>
                ) : (
                  <>
                    <p className="task-subject">{task.subject}</p>
                    <p className={`task-description ${task.done ? "strikethrough" : ""}`}>{task.description || "No description"}</p>
                  </>
                )}
              </div>

              <div className="task-actions">
                {editingId === task.id ? (
                  <>
                    <button className="profile-save-btn" onClick={() => saveEdit(task.id)} aria-label="Save task">Save</button>
                    <button className="profile-cancel-btn" onClick={() => setEditingId(null)} aria-label="Cancel edit">Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="profile-edit-btn" title="Edit" onClick={() => startEdit(task)} aria-label={`Edit ${task.subject}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    <button className="profile-action-btn danger task-delete-button" title="Delete" onClick={() => removeTask(task.id)} aria-label={`Delete ${task.subject}`}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
