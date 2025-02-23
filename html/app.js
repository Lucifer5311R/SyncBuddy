document.addEventListener("DOMContentLoaded", () => {
    try {
        loadTimetable();
        loadTasks();
        loadAnnouncements();
        initializeAnnouncements();
    } catch (error) {
        console.error("Error loading content:", error);
    }

    const navLinks = document.querySelectorAll('.nav-tabs a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
        });
    });
});

// ================== TIMETABLE ==================
function loadTimetable() {
    const timetableBody = document.getElementById("timetableBody");
    if (!timetableBody) return console.error("Timetable body element not found");

    const today = new Date();
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = weekdays[today.getDay()];

    const timetableData = {
        "Monday": [
            { subject: "Math", time: "10:00 AM" },
            { subject: "Science", time: "11:00 AM" },
            { subject: "English", time: "12:00 PM" },
            { subject: "History", time: "2:00 PM" },
            { subject: "Physics", time: "3:00 PM" }
        ],
        "Tuesday": [
            { subject: "Biology", time: "9:00 AM" },
            { subject: "Chemistry", time: "10:00 AM" },
            { subject: "Math", time: "11:00 AM" },
            { subject: "Sports", time: "1:00 PM" },
            { subject: "Computer Science", time: "2:00 PM" }
        ],
        "Wednesday": [
            { subject: "Geography", time: "10:00 AM" },
            { subject: "Math", time: "11:00 AM" },
            { subject: "English", time: "12:00 PM" },
            { subject: "History", time: "2:00 PM" },
            { subject: "Physics", time: "3:00 PM" }
        ],
        "Thursday": [
            { subject: "Biology", time: "9:00 AM" },
            { subject: "Chemistry", time: "10:00 AM" },
            { subject: "Math", time: "11:00 AM" },
            { subject: "Sports", time: "1:00 PM" },
            { subject: "Computer Science", time: "2:00 PM" }
        ],
        "Friday": [
            { subject: "Geography", time: "10:00 AM" },
            { subject: "Math", time: "11:00 AM" },
            { subject: "English", time: "12:00 PM" },
            { subject: "History", time: "2:00 PM" },
            { subject: "Physics", time: "3:00 PM" }
        ],
        "Saturday": [
            { subject: "Math", time: "9:00 AM" },
            { subject: "Science", time: "10:00 AM" },
            { subject: "English", time: "11:00 AM" },
            { subject: "History", time: "12:00 PM" }
        ]
    };

    timetableBody.innerHTML = "";

    if (timetableData[todayName]) {
        timetableData[todayName].forEach(entry => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${entry.subject}</td><td>${entry.time}</td>`;
            row.classList.add("highlight-today");
            timetableBody.appendChild(row);
        });
    } else {
        timetableBody.innerHTML = `<tr><td colspan="2">No classes today!</td></tr>`;
    }
}

// ================== ANNOUNCEMENTS ==================
function requestAccess() {
    const code = prompt("Enter unique code:");
    if (code === "christ") {
        document.getElementById("addANBtn").style.display = "none";
        document.getElementById("announcement-input").classList.remove("hidden");
        document.getElementById("ANType").style.display = "block";
    } else {
        alert("Incorrect code! Access denied.");
    }
}

function showInputBox() {
    const type = document.getElementById("ANType").value;
    const inputBox = document.getElementById("ANI");
    const addButton = document.getElementById("addANBtnFinal");

    if (type) {
        inputBox.classList.remove("hidden");
        addButton.classList.remove("hidden");
    } else {
        inputBox.classList.add("hidden");
        addButton.classList.add("hidden");
    }
}

function addAnnouncement() {
    const ANInput = document.getElementById("ANI");
    const ANText = ANInput.value.trim();

    if (ANText) {
        addANToDOM(ANText);
        saveAnnouncement(ANText);
        ANInput.value = "";
    }
}

function addANToDOM(text) {
    const ANList = document.getElementById("ANList");
    if (!ANList) return console.error("Announcement list element not found");

    const listItem = document.createElement("li");
    listItem.classList.add("announcement-item");

    const ANType = document.getElementById("ANType").value;
    if (ANType) {
        listItem.classList.add(ANType);
    }

    const ANText = document.createElement("span");
    ANText.textContent = text;
    ANText.classList.add("announcement-text");

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.onclick = () => editAnnouncement(text, ANText);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteAnnouncement(text, listItem);

    listItem.appendChild(ANText);
    listItem.appendChild(editBtn);
    listItem.appendChild(deleteBtn);
    ANList.appendChild(listItem);
}

function editAnnouncement(oldText, ANTextElement) {
    const newText = prompt("Edit announcement:", oldText);
    if (newText && newText.trim()) {
        ANTextElement.textContent = newText.trim();
        updateAnnouncement(oldText, newText.trim());
    }
}

function updateAnnouncement(oldText, newText) {
    const announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    const index = announcements.indexOf(oldText);
    if (index !== -1) {
        announcements[index] = newText;
        localStorage.setItem("announcements", JSON.stringify(announcements));
    }
}

function searchAnnouncements() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const ANList = document.getElementById("ANList");
    const items = ANList.getElementsByTagName("li");

    Array.from(items).forEach(item => {
        const text = item.getElementsByClassName("announcement-text")[0].textContent.toLowerCase();
        item.style.display = text.includes(searchInput) ? "" : "none";
    });
}

function initializeAnnouncements() {
    const addANBtn = document.getElementById("addANBtn");
    const announcementInput = document.getElementById("announcement-input");
    const ANType = document.getElementById("ANType");
    const ANI = document.getElementById("ANI");
    const addANBtnFinal = document.getElementById("addANBtnFinal");

    addANBtn.onclick = () => {
        ANType.classList.remove("hidden");
        addANBtn.classList.add("hidden");
    };

    ANType.onchange = () => {
        if (ANType.value) {
            ANI.classList.remove("hidden");
            addANBtnFinal.classList.remove("hidden");
        } else {
            ANI.classList.add("hidden");
            addANBtnFinal.classList.add("hidden");
        }
    };

    announcementInput.classList.add("hidden");
    ANType.classList.add("hidden");
    ANI.classList.add("hidden");
    addANBtnFinal.classList.add("hidden");
}

// ================== TO-DO LIST ==================
function loadTasks() {
    const taskList = document.getElementById("taskList");
    if (!taskList) return console.error("Task list element not found");

    taskList.innerHTML = "";
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    storedTasks.forEach(task => {
        addTaskToDOM(task);
    });
}

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const task = taskInput.value.trim();
    if (task) {
        addTaskToDOM(task);
        saveTask(task);
        taskInput.value = "";
    }
}

function addTaskToDOM(task) {
    const taskList = document.getElementById("taskList");
    if (!taskList) return console.error("Task list element not found");

    const listItem = document.createElement("li");
    listItem.classList.add("task-item");

    const taskText = document.createElement("span");
    taskText.textContent = task;
    taskText.classList.add("task-text");

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.onclick = () => editTask(task, taskText);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✔️";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteTask(task, listItem);

    listItem.appendChild(taskText);
    listItem.appendChild(editBtn);
    listItem.appendChild(deleteBtn);
    taskList.appendChild(listItem);
}

function editTask(oldTask, taskTextElement) {
    const newTask = prompt("Edit task:", oldTask);
    if (newTask && newTask.trim()) {
        taskTextElement.textContent = newTask.trim();
        updateTask(oldTask, newTask.trim());
    }
}

function updateTask(oldTask, newTask) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const index = tasks.indexOf(oldTask);
    if (index !== -1) {
        tasks[index] = newTask;
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
}

function filterTasks() {
    const filter = document.getElementById("taskFilter").value;
    const taskList = document.getElementById("taskList");
    const items = taskList.getElementsByTagName("li");

    Array.from(items).forEach(item => {
        const taskText = item.getElementsByClassName("task-text")[0].textContent;
        if (filter === "all" || (filter === "completed" && item.classList.contains("completed")) || (filter === "pending" && !item.classList.contains("completed"))) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    });
}

// Utility Functions
function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTask(task, listItem) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedTasks = tasks.filter(t => t !== task);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    listItem.remove();
}

function saveAnnouncement(announcement) {
    const announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    announcements.push(announcement);
    localStorage.setItem("announcements", JSON.stringify(announcements));
}

function deleteAnnouncement(announcement, listItem) {
    const announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    const updatedAnnouncements = announcements.filter(a => a !== announcement);
    localStorage.setItem("announcements", JSON.stringify(updatedAnnouncements));
    listItem.remove();
}