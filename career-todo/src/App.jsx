import { useEffect, useRef, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'career-todo-tasks-v1';
const initialTasks = [
  { id: 1, title: 'Learn React', minutes: 120, remaining: 7200, running: false, done: false,
    subtasks: [
      { id: 11, title: 'Review components', done: false },
      { id: 12, title: 'Understand props', done: false },
      { id: 13, title: 'Practice useState', done: false }
    ]
  },
  { id: 2, title: 'Build my project', minutes: 120, remaining: 7200, running: false, done: false,
    subtasks: [
      { id: 21, title: 'Choose one feature', done: false },
      { id: 22, title: 'Implement the feature', done: false },
      { id: 23, title: 'Test and commit code', done: false }
    ]
  }
];

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).map(task => ({ ...task, running: false })) : initialTasks;
  } catch {
    return initialTasks;
  }
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(value => String(value).padStart(2, '0')).join(':');
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [subtaskInputs, setSubtaskInputs] = useState({});
  const [editing, setEditing] = useState(null);
  const audioRef = useRef(null);
  const alertedRef = useRef(new Set());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.map(task => ({ ...task, running: false }))));
  }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(current => current.map(task => {
        if (!task.running || task.done || task.remaining <= 0) return task;
        const remaining = Math.max(0, task.remaining - 1);
        if (remaining === 0 && !alertedRef.current.has(task.id)) {
          alertedRef.current.add(task.id);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Time is up!', { body: `${task.title} timer has finished.` });
            }
            window.alert(`Time is up: ${task.title}`);
          }, 0);
        }
        return { ...task, remaining, running: remaining > 0 };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function enableNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch {}
    }
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }).catch(() => {});
    }
    window.alert('Alarm is set for this open page. Keep this tab open while a timer runs.');
  }

  function addTask(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const duration = Number(minutes);
    if (!cleanTitle || !Number.isFinite(duration) || duration < 1 || duration > 1440) return;
    const seconds = Math.round(duration * 60);
    setTasks(old => [...old, {
      id: Date.now(), title: cleanTitle, minutes: duration, remaining: seconds,
      running: false, done: false, subtasks: []
    }]);
    setTitle('');
    setMinutes('60');
  }

  function updateTask(id, changes) {
    setTasks(old => old.map(task => task.id === id ? { ...task, ...changes } : task));
  }

  function toggleSubtask(taskId, subtaskId) {
    setTasks(old => old.map(task => task.id === taskId ? {
      ...task,
      subtasks: task.subtasks.map(subtask => subtask.id === subtaskId
        ? { ...subtask, done: !subtask.done } : subtask)
    } : task));
  }

  function addSubtask(taskId) {
    const cleanText = (subtaskInputs[taskId] || '').trim();
    if (!cleanText) return;
    setTasks(old => old.map(task => task.id === taskId ? {
      ...task,
      subtasks: [...task.subtasks, { id: Date.now(), title: cleanText, done: false }]
    } : task));
    setSubtaskInputs(old => ({ ...old, [taskId]: '' }));
  }

  function resetTimer(task) {
    alertedRef.current.delete(task.id);
    updateTask(task.id, { remaining: Math.round(task.minutes * 60), running: false });
  }

  function saveEdit(task) {
    const nextTitle = editing?.title?.trim();
    const nextMinutes = Number(editing?.minutes);
    if (!nextTitle || !Number.isFinite(nextMinutes) || nextMinutes < 1 || nextMinutes > 1440) return;
    updateTask(task.id, {
      title: nextTitle, minutes: nextMinutes,
      remaining: Math.round(nextMinutes * 60), running: false
    });
    alertedRef.current.delete(task.id);
    setEditing(null);
  }

  function deleteTask(id) {
    alertedRef.current.delete(id);
    setTasks(old => old.filter(task => task.id !== id));
  }

  const completed = tasks.filter(task => task.done).length;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const subtaskTotal = tasks.reduce((sum, task) => sum + task.subtasks.length, 0);
  const subtaskDone = tasks.reduce((sum, task) => sum + task.subtasks.filter(subtask => subtask.done).length, 0);
  const deadline = new Date(2026, 11, 30);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.max(0, Math.ceil((deadline - today) / 86400000));

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">YOUR DAILY PRODUCTIVITY</p>
          <h1>My To-Do List</h1>
          <p className="subtitle">Small steps every day. Big results for your career.</p>
        </div>
        <div className="deadline">
          <span className="deadline-label">Career goal deadline</span>
          <strong>Dec 30, 2026</strong>
          <span>{daysLeft} days to go</span>
        </div>
      </header>

      <section className="stats">
        <div className="stat-card"><span>Tasks completed</span><strong>{completed}/{tasks.length}</strong></div>
        <div className="stat-card"><span>Daily progress</span><strong>{progress}%</strong></div>
        <div className="stat-card"><span>Subtasks completed</span><strong>{subtaskDone}/{subtaskTotal}</strong></div>
      </section>

      <section className="progress-card">
        <div className="progress-label"><strong>Today's task progress</strong><strong>{progress}%</strong></div>
        <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
      </section>

      <form className="add-form" onSubmit={addTask}>
        <h2>＋ Add a new task</h2>
        <label htmlFor="task-title">Task name</label>
        <input id="task-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Practice React for 2 hours" maxLength={120} required />
        <label htmlFor="task-minutes">Time limit in minutes</label>
        <input id="task-minutes" type="number" min="1" max="1440" value={minutes} onChange={event => setMinutes(event.target.value)} required />
        <div className="form-actions">
          <button className="primary" type="submit">Add task</button>
          <button type="button" onClick={enableNotifications}>Enable alarm / notifications</button>
        </div>
        <p className="hint">Use 120 for 2 hours, 60 for 1 hour, or 30 for 30 minutes.</p>
      </form>

      <section className="tasks-section">
        <div className="section-heading"><h2>Today's tasks</h2><span>{tasks.length} total</span></div>
        {tasks.length === 0 && <div className="empty">No tasks yet. Add your first task above.</div>}
        {tasks.map(task => {
          const doneSubs = task.subtasks.filter(subtask => subtask.done).length;
          const subProgress = task.subtasks.length ? Math.round(doneSubs / task.subtasks.length * 100) : 0;
          return (
            <article className={`task ${task.done ? 'finished' : ''}`} key={task.id}>
              <div className="task-heading">
                <label className="task-name">
                  <input type="checkbox" checked={task.done} onChange={() => updateTask(task.id, { done: !task.done, running: false })} />
                  <span>{task.title}</span>
                </label>
                <div className="task-actions">
                  <button className="small-button" type="button" onClick={() => setEditing({ id: task.id, title: task.title, minutes: String(task.minutes) })}>Edit</button>
                  <button className="small-button delete" type="button" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </div>

              {editing?.id === task.id && (
                <div className="edit-panel">
                  <input aria-label="Edit task name" value={editing.title} onChange={event => setEditing(old => ({ ...old, title: event.target.value }))} />
                  <input aria-label="Edit duration in minutes" type="number" min="1" max="1440" value={editing.minutes} onChange={event => setEditing(old => ({ ...old, minutes: event.target.value }))} />
                  <button className="primary" type="button" onClick={() => saveEdit(task)}>Save</button>
                  <button type="button" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              )}

              <div className="timer-row">
                <div>
                  <div className={`timer ${task.remaining === 0 ? 'timer-ended' : ''}`}>{formatTime(task.remaining)}</div>
                  <p className="muted">{task.done ? 'Task completed' : task.remaining === 0 ? 'Time is up!' : task.running ? 'Timer running' : 'Timer paused'} · Planned: {task.minutes} min</p>
                </div>
                <span className="alarm-icon" title="Alarm enabled">♬</span>
              </div>
              <div className="timer-buttons">
                <button className="primary" type="button" disabled={task.done || task.remaining === 0} onClick={() => updateTask(task.id, { running: !task.running })}>{task.running ? 'Ⅱ Pause' : '▶ Start timer'}</button>
                <button type="button" onClick={() => resetTimer(task)}>↻ Reset</button>
              </div>

              <div className="subtasks">
                <div className="subtask-title"><strong>Subtasks</strong><span>{doneSubs}/{task.subtasks.length} completed</span></div>
                <div className="mini-progress"><div style={{ width: `${subProgress}%` }} /></div>
                {task.subtasks.map(subtask => (
                  <label className="subtask" key={subtask.id}>
                    <input type="checkbox" checked={subtask.done} onChange={() => toggleSubtask(task.id, subtask.id)} />
                    <span className={subtask.done ? 'struck' : ''}>{subtask.title}</span>
                  </label>
                ))}
                <div className="subtask-add">
                  <input value={subtaskInputs[task.id] || ''} onChange={event => setSubtaskInputs(old => ({ ...old, [task.id]: event.target.value }))} placeholder="Add a subtask..." maxLength={160}
                    onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addSubtask(task.id); } }} />
                  <button type="button" onClick={() => addSubtask(task.id)}>＋ Add</button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto" />
      <footer>Made for your career journey · Tasks save in this browser</footer>
    </main>
  );
}
