import { useState } from 'react'

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done';
}

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: Task['status']) => void;
  onAddTask: (title: string, status: Task['status']) => void;
}

const formatDueDate = (dueDate: string) => {
  if (!dueDate) {
    return 'Date TBD';
  }

  const parsed = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return 'Date TBD';
  }

  return parsed.toLocaleDateString();
};

const KanbanBoard = ({ tasks, onMoveTask, onAddTask }: KanbanBoardProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTo, setAddingTo] = useState<Task['status'] | null>(null);

  const columns: { id: Task['status']; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  const handleAddTask = (status: Task['status']) => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle, status);
      setNewTaskTitle('');
      setAddingTo(null);
    }
  };

  return (
    <div className="kanban-board">
      <h1 className="board-title">Kanban Board</h1>
      <div className="columns-container">
        {columns.map(column => (
          <div key={column.id} className="column">
            <div className="column-header">
              <h2>{column.title}</h2>
              <span className="task-count">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>

            <div className="tasks-container">
              {tasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-meta">
                      <span className={`task-badge priority-${task.priority}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="task-assignee">{task.assignee}</span>
                    </div>
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      <div className="task-description">{task.description}</div>
                    </div>
                    <div className="task-footer">
                      <span className="task-due">Due {formatDueDate(task.dueDate)}</span>
                      <div className="task-actions">
                        {column.id !== 'todo' && (
                          <button
                            onClick={() =>
                              onMoveTask(
                                task.id,
                                column.id === 'done' ? 'in-progress' : 'todo'
                              )
                            }
                            className="btn-move"
                            aria-label="Move task backward"
                            type="button"
                          >
                            {'<'}
                          </button>
                        )}
                        {column.id !== 'done' && (
                          <button
                            onClick={() =>
                              onMoveTask(
                                task.id,
                                column.id === 'todo' ? 'in-progress' : 'done'
                              )
                            }
                            className="btn-move"
                            aria-label="Move task forward"
                            type="button"
                          >
                            {'>'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {addingTo === column.id ? (
              <div className="add-task-form">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                />
                <div className="form-actions">
                  <button onClick={() => handleAddTask(column.id)} className="btn-add" type="button">
                    Add
                  </button>
                  <button onClick={() => setAddingTo(null)} className="btn-cancel" type="button">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingTo(column.id)}
                className="btn-new-task"
                type="button"
              >
                + Add Task
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard
