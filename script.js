document.addEventListener('DOMContentLoaded', function() {

    // DOM Elements
    const taskForm = document.getElementById('taskForm');
    const taskTitle = document.getElementById('taskTitle');
    const taskDesc = document.getElementById('taskDesc');
    const editId = document.getElementById('editId');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const incompleteTasks = document.getElementById('incompleteTasks');
    const completedTasks = document.getElementById('completedTasks');
    const toast = document.getElementById('toast');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let isEditing = false;
    
    // Initialize the app
    function init() {
        renderTasks();
        setupDragAndDrop();
    }
    
    // Render all tasks
    function renderTasks() {
        incompleteTasks.innerHTML = '';
        completedTasks.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            if (task.status === 'completed') {
                completedTasks.appendChild(taskElement);
            } else {
                incompleteTasks.appendChild(taskElement);
            }
        });
    }



    // Theme management
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

// Apply saved theme
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeButton(currentTheme);

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
});

function updateThemeButton(theme) {
    themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    themeToggle.style.backgroundColor = theme === 'light' ? '#333' : '#ff9800';
}
    
    // Create task HTML element
    function createTaskElement(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.setAttribute('draggable', 'true');
        taskCard.dataset.id = task.id;
        
        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            ${task.description ? `<p>${task.description}</p>` : ''}
            <div class="task-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        // Add event listeners for edit and delete
        taskCard.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
        taskCard.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
        
        // Drag events
        taskCard.addEventListener('dragstart', dragStart);
        
        return taskCard;
    }
    
    // Form submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = taskTitle.value.trim();
        const description = taskDesc.value.trim();
        
        if (!title) return;
        
        if (isEditing) {
            // Update existing task
            const taskId = editId.value;
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    title,
                    description
                };
                
                saveTasks();
                showToast('✏️ Task Updated');
                cancelEdit();
            }
        } else {
            // Add new task
            const newTask = {
                id: Date.now().toString(),
                title,
                description,
                status: 'incomplete'
            };
            
            tasks.push(newTask);
            saveTasks();
            showToast('✅ Task Created');
        }
        
        taskForm.reset();
        renderTasks();
    });
    
    // Cancel edit
    cancelBtn.addEventListener('click', cancelEdit);
    
    function cancelEdit() {
        isEditing = false;
        editId.value = '';
        submitBtn.textContent = 'Add Task';
        cancelBtn.style.display = 'none';
        taskForm.reset();
    }
    
    // Edit task
    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        
        isEditing = true;
        taskTitle.value = task.title;
        taskDesc.value = task.description || '';
        editId.value = task.id;
        submitBtn.textContent = 'Update Task';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll to form
        taskForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Delete task
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            showToast('🗑️ Task Deleted');
        }
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Show toast notification
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Drag and Drop functionality
    function setupDragAndDrop() {
        const taskLists = [incompleteTasks, completedTasks];
        
        taskLists.forEach(list => {
            list.addEventListener('dragover', dragOver);
            list.addEventListener('dragenter', dragEnter);
            list.addEventListener('dragleave', dragLeave);
            list.addEventListener('drop', drop);
        });
    }
    
    let draggedItem = null;
    
    function dragStart(e) {
        draggedItem = this;
        setTimeout(() => this.classList.add('dragging'), 0);
        e.dataTransfer.effectAllowed = 'move';
    }
    
    function dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function dragEnter(e) {
        e.preventDefault();
        this.classList.add('drop-target');
    }
    
    function dragLeave() {
        this.classList.remove('drop-target');
    }
    
    function drop(e) {
        e.preventDefault();
        this.classList.remove('drop-target');
        
        if (draggedItem) {
            const taskId = draggedItem.dataset.id;
            const newStatus = this.dataset.status;
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex !== -1) {
                const oldStatus = tasks[taskIndex].status;
                
                if (oldStatus !== newStatus) {
                    tasks[taskIndex].status = newStatus;
                    saveTasks();
                    
                    if (newStatus === 'completed') {
                        showToast('🔄 Task Moved to Completed');
                    } else {
                        showToast('🔄 Task Moved to Incomplete');
                    }
                }
                
                this.appendChild(draggedItem);
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
        }
    }
    
    // Initialize the app
    init();
});


