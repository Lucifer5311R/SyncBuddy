document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    document.getElementById("addTaskBtn").addEventListener("click", addTask);
    document.getElementById("taskInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTask();
        }
    });
    document.getElementById("taskFilter").addEventListener("change", filterTasks);
});

async function loadTasks() {
    try {
        const response = await fetch('/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";
        tasks.forEach(task => addTaskToDOM(task));
        filterTasks(); // Apply filter after loading tasks
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

async function addTask() {
    const taskInput = document.getElementById("taskInput");
    const task = { text: taskInput.value.trim(), completed: false };
    if (task.text) {
        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });
            if (!response.ok) throw new Error('Failed to add task');
            const newTask = await response.json();
            addTaskToDOM(newTask);
            taskInput.value = "";
            filterTasks(); // Apply filter after adding a task
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }
}

function addTaskToDOM(task) {
    const taskList = document.getElementById("taskList");
    if (!taskList) return console.error("Task list element not found");

    const listItem = document.createElement("li");
    listItem.classList.add("task-item");
    if (task.completed) listItem.classList.add("completed");
    listItem.dataset.id = task._id;

    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.classList.add("task-text");

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.onclick = () => editTask(task, taskText);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✔️";
    deleteBtn.classList.add("delete-btn");
    // Changed: Call deleteTask instead of completeTask on tick press
    deleteBtn.onclick = () => deleteTask(task._id, listItem);

    listItem.appendChild(taskText);
    listItem.appendChild(editBtn);
    listItem.appendChild(deleteBtn);
    taskList.appendChild(listItem);
}

// Updated deleteTask function with improved error logging
async function deleteTask(taskId, listItem) {
    try {
        const response = await fetch(`/tasks/${taskId}`, { method: 'DELETE' });
        console.log("Response for deletion:", response);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete task: ${response.status} ${errorText}`);
        }
        console.log("Task deleted successfully");
        listItem.remove();
        filterTasks(); // Update filter after deletion
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

// Optionally remove or comment out the original completeTask function
/* async function completeTask(taskId, listItem) {
    try {
        const response = await fetch(`/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true })
        });
        if (!response.ok) throw new Error('Failed to complete task');
        const updatedTask = await response.json();
        console.log("Task completed:", updatedTask);
        listItem.classList.add("completed");
        listItem.querySelector(".delete-btn").disabled = true;
        filterTasks(); // Apply filter after completing a task
    } catch (error) {
        console.error("Error completing task:", error);
    }
} */

function editTask(oldTask, taskTextElement) {
    const newTask = prompt("Edit task:", oldTask.text);
    if (newTask && newTask.trim()) {
        taskTextElement.textContent = newTask.trim();
        updateTask(oldTask._id, newTask.trim());
    }
}

async function updateTask(taskId, newText) {
    try {
        const response = await fetch(`/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newText })
        });
        if (!response.ok) throw new Error('Failed to update task');
        const updatedTask = await response.json();
        console.log("Task updated:", updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
    }
}

function filterTasks() {
    const filter = document.getElementById("taskFilter").value;
    const taskList = document.getElementById("taskList");
    const items = taskList.getElementsByTagName("li");

    Array.from(items).forEach(item => {
        const isCompleted = item.classList.contains("completed");
        if (filter === "all" || (filter === "completed" && isCompleted) || (filter === "pending" && !isCompleted)) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    });
}
