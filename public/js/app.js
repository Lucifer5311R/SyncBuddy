document.addEventListener("DOMContentLoaded", () => {
    try {
        loadTimetable();
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