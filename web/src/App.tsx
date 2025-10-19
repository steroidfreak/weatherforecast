import { useState, useEffect } from 'react'
import KanbanBoard from './KanbanBoard'

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Design mockups', status: 'todo' },
    { id: '2', title: 'Setup project', status: 'in-progress' },
    { id: '3', title: 'Research competitors', status: 'done' }
  ]);

  // Listen for data from MCP server (if needed)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.tasks) {
        try {
          const parsedTasks = JSON.parse(event.data.tasks);
          setTasks(parsedTasks);
        } catch (e) {
          console.error('Failed to parse tasks:', e);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const addTask = (title: string, status: Task['status']) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      status
    };
    setTasks(prev => [...prev, newTask]);
  };

  return (
    <KanbanBoard 
      tasks={tasks} 
      onMoveTask={moveTask}
      onAddTask={addTask}
    />
  );
}

export default App
