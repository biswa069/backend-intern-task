import { useEffect, useState } from 'react';
import API from '../api';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2, CheckCircle, Circle, Loader2 } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  status: 'pending' | 'completed';
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(Cookies.get('user') || '{}');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data.tasks); // Based on your backend response structure
    } catch (error) {
      console.error(error);
      // Optional: Redirect to login if 401
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      const { data } = await API.post('/tasks', { title: newTask });
      setTasks([data.task, ...tasks]); // Optimistic update
      setNewTask('');
    } catch (error) {
      alert('Failed to create task');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    
    // Optimistic UI update
    setTasks(tasks.map(t => t._id === id ? { ...t, status: newStatus } : t));

    try {
      await API.put(`/tasks/${id}`, { status: newStatus });
    } catch (error) {
      fetchTasks(); // Revert on error
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    
    setTasks(tasks.filter(t => t._id !== id)); // Optimistic UI
    try {
      await API.delete(`/tasks/${id}`);
    } catch (error) {
      fetchTasks();
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">Task Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome, {user.name || 'User'}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        {/* Add Task Form */}
        <form onSubmit={createTask} className="flex gap-3 mb-8">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-white font-bold flex items-center gap-2">
            <Plus size={20} /> Add
          </button>
        </form>

        {/* Task List */}
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
        ) : (
          <ul className="space-y-3">
            {tasks.length === 0 && <p className="text-center text-gray-500">No tasks yet. Add one above!</p>}
            
            {tasks.map((task) => (
              <li 
                key={task._id} 
                className={`flex justify-between items-center p-4 rounded border transition-all ${
                  task.status === 'completed' 
                    ? 'bg-gray-800/50 border-gray-800 opacity-70' 
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleStatus(task._id, task.status)}>
                    {task.status === 'completed' 
                      ? <CheckCircle className="text-green-500" /> 
                      : <Circle className="text-gray-400 hover:text-blue-400" />
                    }
                  </button>
                  <span className={task.status === 'completed' ? 'line-through text-gray-500' : ''}>
                    {task.title}
                  </span>
                </div>
                
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}