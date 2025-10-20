import { useState, useEffect } from 'react'
import KanbanBoard from './KanbanBoard'

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done';
}

const seededTasks: Task[] = [
  {
    id: 'task-101',
    title: 'Design dashboard wireframes',
    description: 'Create responsive wireframes for the analytics dashboard.',
    assignee: 'Sasha',
    priority: 'high',
    dueDate: '2025-10-28',
    status: 'todo'
  },
  {
    id: 'task-102',
    title: 'Prepare stakeholder brief',
    description: 'Summarize project goals for the Thursday status meeting.',
    assignee: 'Lee',
    priority: 'medium',
    dueDate: '2025-10-23',
    status: 'todo'
  },
  {
    id: 'task-201',
    title: 'Set up CI pipeline',
    description: 'Configure GitHub Actions with lint and unit test steps.',
    assignee: 'Jordan',
    priority: 'high',
    dueDate: '2025-10-21',
    status: 'in-progress'
  },
  {
    id: 'task-202',
    title: 'Refine onboarding copy',
    description: 'Tighten messaging for the multi-step onboarding flow.',
    assignee: 'Avery',
    priority: 'medium',
    dueDate: '2025-10-25',
    status: 'in-progress'
  },
  {
    id: 'task-203',
    title: 'Accessibility review',
    description: 'Audit color contrast and keyboard navigation on key pages.',
    assignee: 'Sasha',
    priority: 'high',
    dueDate: '2025-10-27',
    status: 'in-progress'
  },
  {
    id: 'task-301',
    title: 'Ship notification service',
    description: 'Deploy the notification microservice to the staging cluster.',
    assignee: 'Morgan',
    priority: 'high',
    dueDate: '2025-10-19',
    status: 'done'
  },
  {
    id: 'task-302',
    title: 'Close beta feedback loop',
    description: 'Capture beta tester feedback and publish summary notes.',
    assignee: 'Avery',
    priority: 'medium',
    dueDate: '2025-10-18',
    status: 'done'
  },
  {
    id: 'task-303',
    title: 'Update product roadmap',
    description: 'Refresh Q4 roadmap to include analytics backlog items.',
    assignee: 'Lee',
    priority: 'low',
    dueDate: '2025-10-20',
    status: 'done'
  }
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(seededTasks);

  // Listen for data from MCP server (if needed)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.tasks) {
        try {
          const parsedTasks = JSON.parse(event.data.tasks);
          if (Array.isArray(parsedTasks)) {
            setTasks(parsedTasks);
          } else {
            console.warn('Ignoring non-array tasks payload from message event.');
          }
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
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: 'Quick capture via inline add button.',
      assignee: 'Unassigned',
      priority: 'medium',
      dueDate: defaultDueDate.toISOString().slice(0, 10),
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
