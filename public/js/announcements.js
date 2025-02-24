document.addEventListener("DOMContentLoaded", () => {
    loadAnnouncements();
    initializeAnnouncements();
    setupPushNotifications();
});

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
    const scheduleInput = document.getElementById("scheduleInput");
    const attachmentInput = document.getElementById("attachmentInput");
    const recurringInput = document.getElementById("recurringInput");

    if (type) {
        inputBox.classList.remove("hidden");
        addButton.classList.remove("hidden");
        attachmentInput.classList.remove("hidden");
        recurringInput.classList.remove("hidden");
        if (type === "reminder") {
            scheduleInput.classList.remove("hidden");
        } else {
            scheduleInput.classList.add("hidden");
        }
    } else {
        inputBox.classList.add("hidden");
        addButton.classList.add("hidden");
        scheduleInput.classList.add("hidden");
        attachmentInput.classList.add("hidden");
        recurringInput.classList.add("hidden");
    }
}

function addAnnouncement() {
    const ANInput = document.getElementById("ANI");
    const ANText = ANInput.value.trim();
    const ANType = document.getElementById("ANType").value;
    const scheduleTime = document.getElementById("scheduleInput").value;
    const attachments = Array.from(document.getElementById("attachmentInput").files).map(file => URL.createObjectURL(file));
    const recurring = document.getElementById("recurringInput").value;

    if (ANText) {
        if (ANType === "reminder" && scheduleTime) {
            const scheduleDate = new Date(scheduleTime);
            const now = new Date();
            const delay = scheduleDate - now;
            if (delay > 0) {
                setTimeout(() => {
                    addANToDOM(ANText, ANType, attachments, recurring);
                    saveAnnouncement(ANText, ANType, attachments, recurring);
                    sendPushNotification(ANText, ANType);
                }, delay);
            } else {
                alert("Scheduled time must be in the future.");
            }
        } else {
            addANToDOM(ANText, ANType, attachments, recurring);
            saveAnnouncement(ANText, ANType, attachments, recurring);
            sendPushNotification(ANText, ANType);
        }
        ANInput.value = "";
        document.getElementById("scheduleInput").value = "";
        document.getElementById("attachmentInput").value = "";
        document.getElementById("recurringInput").value = "none";
    }
}

function addANToDOM(text, type, attachments, recurring) {
    const ANList = document.getElementById("ANList");
    if (!ANList) return console.error("Announcement list element not found");

    const listItem = document.createElement("li");
    listItem.classList.add("announcement-item");

    if (type) {
        listItem.classList.add(type);
    }

    const ANText = document.createElement("span");
    ANText.innerHTML = text; // Allow HTML for rich text formatting
    ANText.classList.add("announcement-text");

    const attachmentList = document.createElement("ul");
    attachmentList.classList.add("attachment-list");
    attachments.forEach(attachment => {
        const attachmentItem = document.createElement("li");
        const attachmentLink = document.createElement("a");
        attachmentLink.href = attachment;
        attachmentLink.textContent = attachment.split('/').pop();
        attachmentLink.target = "_blank";
        attachmentItem.appendChild(attachmentLink);
        attachmentList.appendChild(attachmentItem);
    });

    const recurringText = document.createElement("span");
    recurringText.textContent = `Recurring: ${recurring}`;
    recurringText.classList.add("recurring-text");

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.onclick = () => editAnnouncement(text, ANText);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteAnnouncement(text, listItem);

    listItem.appendChild(ANText);
    listItem.appendChild(attachmentList);
    listItem.appendChild(recurringText);
    listItem.appendChild(editBtn);
    listItem.appendChild(deleteBtn);
    ANList.appendChild(listItem);
}

function editAnnouncement(oldText, ANTextElement) {
    const newText = prompt("Edit announcement:", oldText);
    if (newText && newText.trim()) {
        ANTextElement.innerHTML = newText.trim(); // Allow HTML for rich text formatting
        updateAnnouncement(oldText, newText.trim());
    }
}

function updateAnnouncement(oldText, newText) {
    try {
        const announcements = JSON.parse(localStorage.getItem("announcements")) || [];
        const index = announcements.findIndex(a => a.text === oldText);
        if (index !== -1) {
            announcements[index].text = newText;
            localStorage.setItem("announcements", JSON.stringify(announcements));
        }
    } catch (error) {
        console.error("Error updating announcement:", error);
    }
}

function deleteAnnouncement(text, listItem) {
    try {
        const announcements = JSON.parse(localStorage.getItem("announcements")) || [];
        const updatedAnnouncements = announcements.filter(a => a.text !== text);
        localStorage.setItem("announcements", JSON.stringify(updatedAnnouncements));
        listItem.remove();
    } catch (error) {
        console.error("Error deleting announcement:", error);
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
    const scheduleInput = document.getElementById("scheduleInput");
    const attachmentInput = document.getElementById("attachmentInput");
    const recurringInput = document.getElementById("recurringInput");

    // Updated: Use addEventListener instead of setting onclick/onchange directly
    addANBtn.addEventListener("click", () => {
        ANType.classList.remove("hidden");
        addANBtn.classList.add("hidden");
    });

    ANType.addEventListener("change", () => {
        if (ANType.value) {
            ANI.classList.remove("hidden");
            addANBtnFinal.classList.remove("hidden");
            attachmentInput.classList.remove("hidden");
            recurringInput.classList.remove("hidden");
            if (ANType.value === "reminder") {
                scheduleInput.classList.remove("hidden");
            } else {
                scheduleInput.classList.add("hidden");
            }
        } else {
            ANI.classList.add("hidden");
            addANBtnFinal.classList.add("hidden");
            scheduleInput.classList.add("hidden");
            attachmentInput.classList.add("hidden");
            recurringInput.classList.add("hidden");
        }
    });

    announcementInput.classList.add("hidden");
    ANType.classList.add("hidden");
    ANI.classList.add("hidden");
    addANBtnFinal.classList.add("hidden");
    scheduleInput.classList.add("hidden");
    attachmentInput.classList.add("hidden");
    recurringInput.classList.add("hidden");
}

async function loadAnnouncements() {
    try {
        const announcements = JSON.parse(localStorage.getItem("announcements")) || [];
        const ANList = document.getElementById("ANList");
        ANList.innerHTML = "";
        announcements.forEach(({ text, type, attachments, recurring }) => addANToDOM(text, type, attachments, recurring));
    } catch (error) {
        console.error("Error loading announcements:", error);
    }
}

function saveAnnouncement(text, type, attachments, recurring) {
    try {
        const announcements = JSON.parse(localStorage.getItem("announcements")) || [];
        announcements.push({ text, type, attachments, recurring });
        localStorage.setItem("announcements", JSON.stringify(announcements));
    } catch (error) {
        console.error("Error saving announcement:", error);
    }
}

function setupPushNotifications() {
    if ('Notification' in window && navigator.serviceWorker) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                    subscribeUserToPush(registration);
                }).catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
            }
        });
    }
}

function subscribeUserToPush(registration) {
    const publicVapidKey = 'BPz11OIfPgVfTz4rmzZzZlW2CbyzipWg1Jmz2gjg_FYv0lMW-bK39QokCmoQWpAoLm2N81UOP2wawqmwV2QYmxw';
    const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
    registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
    }).then(subscription => {
        fetch('/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => console.log('Subscribed to push notifications'))
        .catch(error => console.error('Failed to subscribe to push notifications', error));
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function sendPushNotification(text, type) {
    if ('Notification' in window && navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(registration => {
            fetch('/send-notification', {
                method: 'POST',
                body: JSON.stringify({ title: 'New Announcement', body: `${type.toUpperCase()}: ${text}` }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(() => console.log('Push notification sent'))
            .catch(error => console.error('Failed to send push notification', error));
        });
    }
}
