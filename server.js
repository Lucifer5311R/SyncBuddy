const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const webpush = require('web-push');
const schedule = require('node-schedule');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studentProductivity', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define Schemas and Models
const TaskSchema = new mongoose.Schema({
    text: String,
    completed: Boolean
});

const Task = mongoose.model('Task', TaskSchema);

const AnnouncementSchema = new mongoose.Schema({
    text: String,
    type: String,
    scheduledTime: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    attachments: [String],
    history: [{
        text: String,
        updatedAt: { type: Date, default: Date.now }
    }],
    recurring: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    views: [{ userId: String, viewedAt: { type: Date, default: Date.now } }]
});

const Announcement = mongoose.model('Announcement', AnnouncementSchema);

// Web Push setup
const publicVapidKey = 'BPz11OIfPgVfTz4rmzZzZlW2CbyzipWg1Jmz2gjg_FYv0lMW-bK39QokCmoQWpAoLm2N81UOP2wawqmwV2QYmxw';
const privateVapidKey = 'ShXLAUvLGDWKKM3FHKRKZrH3eNUNBNexjGYe-YDUnmY';

webpush.setVapidDetails('mailto:example@yourdomain.org', publicVapidKey, privateVapidKey);

// Routes
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Push notification subscription route
let subscriptions = [];

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
    const payload = JSON.stringify({ title: 'Push Test', body: 'Subscription successful!' });
    webpush.sendNotification(subscription, payload).catch(error => console.error(error));
});

// Send push notification
app.post('/send-notification', (req, res) => {
    const { title, body } = req.body;
    const payload = JSON.stringify({ title, body });
    subscriptions.forEach(subscription => {
        webpush.sendNotification(subscription, payload).catch(error => console.error(error));
    });
    res.status(200).json({ message: 'Notification sent' });
});

// Schedule announcement
app.post('/schedule-announcement', async (req, res) => {
    const { text, type, scheduledTime, attachments, recurring } = req.body;
    const announcement = new Announcement({ text, type, scheduledTime, attachments, recurring });
    await announcement.save();

    const scheduleJob = () => {
        const payload = JSON.stringify({ title: 'New Announcement', body: `${type.toUpperCase()}: ${text}` });
        subscriptions.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => console.error(error));
        });
    };

    schedule.scheduleJob(new Date(scheduledTime), scheduleJob);

    if (recurring !== 'none') {
        let rule;
        switch (recurring) {
            case 'daily':
                rule = '0 0 * * *'; // Every day at midnight
                break;
            case 'weekly':
                rule = '0 0 * * 0'; // Every Sunday at midnight
                break;
            case 'monthly':
                rule = '0 0 1 * *'; // Every 1st of the month at midnight
                break;
        }
        schedule.scheduleJob(rule, scheduleJob);
    }

    res.status(201).json({ message: 'Announcement scheduled' });
});

// Track announcement views
app.post('/track-view', async (req, res) => {
    const { announcementId, userId } = req.body;
    try {
        const announcement = await Announcement.findById(announcementId);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        announcement.views.push({ userId });
        await announcement.save();
        res.status(200).json({ message: 'View tracked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});