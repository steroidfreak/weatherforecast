import { useState, useEffect, useCallback, type CSSProperties } from 'react'
import KanbanBoard from './KanbanBoard'
import { useOpenAiGlobal, useToolOutput, useWidgetState } from './openai'

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

const DEFAULT_WIDGET_STATE_KEY = 'tasks'

function App() {
  const theme = useOpenAiGlobal('theme')
  const displayMode = useOpenAiGlobal('displayMode')
  const maxHeight = useOpenAiGlobal('maxHeight')
  const safeArea = useOpenAiGlobal('safeArea')
  const toolOutput = useToolOutput<{ tasks?: Task[] } | null>()
  const widgetState = useWidgetState<{ tasks?: Task[] } | null>()

  const [tasks, setTasks] = useState<Task[]>(seededTasks)

  useEffect(() => {
    const candidate = toolOutput?.tasks ?? widgetState?.tasks
    if (candidate && Array.isArray(candidate)) {
      setTasks(prev => {
        const areEqual = JSON.stringify(prev) === JSON.stringify(candidate)
        return areEqual ? prev : candidate
      })
    }
  }, [toolOutput, widgetState])

  const syncTasks = useCallback((updater: (previous: Task[]) => Task[]) => {
    setTasks(prev => {
      const next = updater(prev)
      if (typeof window !== 'undefined' && window.openai?.setWidgetState) {
        const existingState = (widgetState ?? {}) as Record<string, unknown>
        void window.openai.setWidgetState({
          ...existingState,
          [DEFAULT_WIDGET_STATE_KEY]: next
        })
      }
      return next
    })
  }, [widgetState])

  const moveTask = useCallback((taskId: string, newStatus: Task['status']) => {
    syncTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }, [syncTasks])

  const addTask = useCallback((title: string, status: Task['status']) => {
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 7)

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: 'Quick capture via inline add button.',
      assignee: 'Unassigned',
      priority: 'medium',
      dueDate: defaultDueDate.toISOString().slice(0, 10),
      status
    }

    syncTasks(prev => [...prev, newTask])
  }, [syncTasks])

  const containerStyle: CSSProperties = {
    maxHeight: Number.isFinite(maxHeight) && maxHeight > 0 ? maxHeight : undefined,
    paddingBottom: safeArea?.insets?.bottom ?? 0,
    paddingLeft: safeArea?.insets?.left ?? 0,
    paddingRight: safeArea?.insets?.right ?? 0,
    paddingTop: safeArea?.insets?.top ?? 0
  }

  return (
    <div
      className={`app-container theme-${theme} display-${displayMode}`}
      style={containerStyle}
    >
      <KanbanBoard
        tasks={tasks}
        onMoveTask={moveTask}
        onAddTask={addTask}
      />
    </div>
  )
}

export default App
