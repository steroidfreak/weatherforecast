import { useState } from 'react'

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
}

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: Task['status']) => void;
  onAddTask: (title: string, status: Task['status']) => void;
}

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
                    <div className="task-content">{task.title}</div>
                    <div className="task-actions">
                      {column.id !== 'todo' && (
                        <button
                          onClick={() => onMoveTask(task.id, 
                            column.id === 'done' ? 'in-progress' : 'todo'
                          )}
                          className="btn-move"
                        >
                          ←
                        </button>
                      )}
                      {column.id !== 'done' && (
                        <button
                          onClick={() => onMoveTask(task.id,
                            column.id === 'todo' ? 'in-progress' : 'done'
                          )}
                          className="btn-move"
                        >
                          →
                        </button>
                      )}
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
                  <button onClick={() => handleAddTask(column.id)} className="btn-add">
                    Add
                  </button>
                  <button onClick={() => setAddingTo(null)} className="btn-cancel">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setAddingTo(column.id)}
                className="btn-new-task"
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
