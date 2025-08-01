import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Calendar, User, Tag, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmbeddedComments from './EmbeddedComments';
import { firebaseTasks, FirebaseTask } from '../services/firebase';

interface Task extends FirebaseTask {
  // Extend FirebaseTask to include any additional local properties
}

interface Column {
  id: string;
  title: string;
  status: Task['status'];
  color: string;
}

const PlanningBoard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignee: '',
    dueDate: '',
    tags: ''
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const columns: Column[] = [
    { id: 'todo', title: 'To Do', status: 'todo', color: 'bg-gray-800' },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress', color: 'bg-blue-900' },
    { id: 'review', title: 'Review', status: 'review', color: 'bg-yellow-900' },
    { id: 'done', title: 'Done', status: 'done', color: 'bg-green-900' }
  ];

  // Load tasks from Firebase
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const tasksData = await firebaseTasks.getAll();
        setTasks(tasksData as Task[]);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !user) return;

    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        status: 'todo' as const,
        priority: newTask.priority,
        assignee: newTask.assignee.trim() || undefined,
        assigneeId: user.id,
        dueDate: newTask.dueDate || undefined,
        tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const taskId = await firebaseTasks.add(taskData);
      
      if (taskId) {
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          assignee: '',
          dueDate: '',
          tags: ''
        });
        setShowAddTask(false);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: Task['status']) => {
    try {
      await firebaseTasks.update(taskId, { status: newStatus });
      // Task will be updated by the real-time listener
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await firebaseTasks.delete(taskId);
      // Task will be removed by the real-time listener
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderTask = (task: Task) => (
    <div
      key={task.id}
      className="bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-700 mb-3 cursor-pointer hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-white text-sm">{task.title}</h4>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTask(selectedTask?.id === task.id ? null : task);
            }}
            className="text-gray-400 hover:text-primary-600"
          >
            <MessageSquare className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTask(task.id);
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-300 text-xs mb-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </span>
          {task.assignee && (
            <div className="flex items-center space-x-1 text-gray-400">
              <User className="h-3 w-3" />
              <span>{task.assignee}</span>
            </div>
          )}
        </div>
        {task.dueDate && (
          <div className="flex items-center space-x-1 text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
      
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Embedded Comments */}
      {selectedTask?.id === task.id && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <EmbeddedComments
            contextId={task.id}
            contextType="task"
          />
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Planning Board</h2>
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {showAddTask && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Task</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Task description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assignee (Optional)
                </label>
                <input
                  type="text"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Assignee name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className={`${column.color} p-4 rounded-lg`}>
              <h3 className="text-lg font-semibold text-white">{column.title}</h3>
              <p className="text-gray-300 text-sm">
                {tasks.filter(task => task.status === column.status).length} tasks
              </p>
            </div>
            <div
              className="min-h-[200px] p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                handleMoveTask(taskId, column.status);
              }}
            >
              {tasks
                .filter(task => task.status === column.status)
                .map(task => renderTask(task))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanningBoard; 