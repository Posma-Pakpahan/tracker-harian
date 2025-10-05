const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const { startOfWeek, endOfWeek, eachDayOfInterval, format } = require('date-fns');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = 'rahasia-banget-jangan-disebar';

function createDefaultScheduleForUser(userId) {
    console.log(`Membuat jadwal bawaan untuk user dengan ID: ${userId}`);
    db.serialize(() => {
        const insert = db.prepare("INSERT INTO schedule_templates (user_id, day_of_week, activity_name, start_time) VALUES (?, ?, ?, ?)");
        const schedule = {
            weekday: [ { name: "Bangun Pagi", time: "05:30" }, { name: "Saat Teduh & Baca Alkitab", time: "05:45" }, { name: "Olahraga Ringan / Meditasi", time: "06:15" }, { name: "Sarapan & Persiapan", time: "07:00" }, { name: "Belajar Sesi 1", time: "08:00" }, { name: "Belajar Sesi 2", time: "09:00" }, { name: "Istirahat Singkat", time: "10:00" }, { name: "Kerja / Aktivitas Produktif", time: "10:15" }, { name: "Makan Siang & Istirahat", time: "12:00" }, { name: "Kerja / Aktivitas Produktif", time: "13:30" }, { name: "Istirahat Sore", time: "16:00" }, { name: "Hobi / Waktu Pribadi", time: "17:00" }, { name: "Mandi & Bersantai", time: "18:00" }, { name: "Makan Malam", time: "19:00" }, { name: "Waktu Bersama Keluarga / Teman", time: "20:00" }, { name: "Persiapan untuk Besok & Jurnal", time: "21:30" }, { name: "Tidur", time: "22:00" }, ],
            saturday: [ { name: "Bangun Pagi", time: "06:00" }, { name: "Saat Teduh & Baca Alkitab", time: "06:15" }, { name: "Sarapan", time: "07:30" }, { name: "Belajar Sesi 1", time: "08:30" }, { name: "Belajar Sesi 2", time: "09:30" }, { name: "Waktu Bebas / Hobi", time: "10:30" }, { name: "Makan Siang", time: "12:30" }, { name: "Bersih-bersih / Merapikan Kamar", time: "14:00" }, { name: "Persiapan Koor", time: "15:30" }, { name: "Latihan Koor Naposo", time: "16:00" }, { name: "Pulang & Mandi", time: "18:30" }, { name: "Makan Malam", time: "19:30" }, { name: "Malam Minggu Santai", time: "20:30" }, { name: "Tidur", time: "23:00" }, ],
            sunday: [ { name: "Bangun Pagi & Persiapan Ibadah", time: "07:00" }, { name: "Sarapan Ringan", time: "07:45" }, { name: "Berangkat ke Gereja", time: "08:30" }, { name: "Ibadah Pagi", time: "09:00" }, { name: "Selesai Ibadah & Bersosialisasi", time: "11:00" }, { name: "Makan Siang Bersama", time: "12:30" }, { name: "Istirahat Siang / Tidur Siang", time: "14:00" }, { name: "Waktu Keluarga / Pelayanan", time: "15:30" }, { name: "Saat Teduh Sore", time: "18:00" }, { name: "Makan Malam", time: "19:00" }, { name: "Belajar (Review Mingguan & Rencana)", time: "20:00" }, { name: "Santai & Persiapan Minggu Baru", time: "21:00" }, { name: "Tidur", time: "22:00" }, ]
        };
        schedule.weekday.forEach(act => [1, 2, 3, 4, 5].forEach(day => insert.run(userId, day, act.name, act.time)));
        schedule.saturday.forEach(act => insert.run(userId, 6, act.name, act.time));
        schedule.sunday.forEach(act => insert.run(userId, 0, act.name, act.time));
        insert.finalize(err => {
            if (err) console.error("Gagal finalisasi seeder:", err.message);
            else console.log(`Jadwal bawaan untuk user ID ${userId} berhasil dibuat.`);
        });
    });
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Username dan password dibutuhkan" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
        db.run(sql, [username, hashedPassword], function(err) {
            if (err) return res.status(409).json({ error: "Username sudah digunakan" });
            createDefaultScheduleForUser(this.lastID);
            res.status(201).json({ success: true, id: this.lastID });
        });
    } catch { res.status(500).json({ error: "Terjadi kesalahan pada server" }); }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: "Username atau password salah" });
        if (await bcrypt.compare(password, user.password_hash)) {
            const accessToken = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ accessToken: accessToken });
        } else {
            res.status(400).json({ error: "Username atau password salah" });
        }
    });
});

app.get('/api/week-data', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const refDate = req.query.date ? new Date(req.query.date) : new Date();
    const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(refDate, { weekStartsOn: 1 });
    
    // ==========================================================
    // BARIS YANG HILANG SEBELUMNYA ADA DI SINI. SEKARANG SUDAH DIPERBAIKI.
    // ==========================================================
    const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weekDateStrings = weekDates.map(d => format(d, 'yyyy-MM-dd'));
    const sql = `
        SELECT t.id, t.day_of_week, t.activity_name, t.start_time, r.record_date, IFNULL(r.completed, 0) as completed
        FROM schedule_templates t
        LEFT JOIN activity_records r ON t.id = r.template_id AND r.user_id = ? AND r.record_date IN (${weekDateStrings.map(() => '?').join(',')})
        WHERE t.user_id = ? ORDER BY t.day_of_week, t.start_time
    `;
    db.all(sql, [userId, ...weekDateStrings, userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        let totalTasks = 0, completedTasks = 0;
        const days = weekDates.map((dateObj, index) => {
            const dayOfWeek = dateObj.getDay();
            const dateStr = weekDateStrings[index];
            const activitiesForDay = rows.filter(r => r.day_of_week === dayOfWeek).map(act => {
                const relevantRecord = rows.find(r => r.id === act.id && r.record_date === dateStr);
                totalTasks++;
                if (relevantRecord && relevantRecord.completed) completedTasks++;
                return { id: act.id, name: act.activity_name, time: act.start_time, completed: relevantRecord ? relevantRecord.completed : 0 };
            });
            return { date: dateStr, dayName: format(dateObj, 'eeee'), activities: activitiesForDay };
        });
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        res.json({ weekOf: format(weekStart, 'yyyy-MM-dd'), percentage, days });
    });
});

// Rute CRUD lainnya tidak berubah
app.post('/api/update', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { templateId, date, completed } = req.body;
    const sql = `INSERT INTO activity_records (user_id, template_id, record_date, completed) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, template_id, record_date) DO UPDATE SET completed = excluded.completed;`;
    db.run(sql, [userId, templateId, date, completed ? 1 : 0], function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ success: true }); });
});
app.post('/api/activities', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { day_of_week, activity_name, start_time } = req.body;
    const sql = 'INSERT INTO schedule_templates (user_id, day_of_week, activity_name, start_time) VALUES (?, ?, ?, ?)';
    db.run(sql, [userId, day_of_week, activity_name, start_time], function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ success: true, id: this.lastID }); });
});
app.put('/api/activities/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { activity_name, start_time } = req.body;
    const sql = 'UPDATE schedule_templates SET activity_name = ?, start_time = ? WHERE id = ? AND user_id = ?';
    db.run(sql, [activity_name, start_time, req.params.id, userId], function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ success: true, changes: this.changes }); });
});
app.delete('/api/activities/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    const sql = 'DELETE FROM schedule_templates WHERE id = ? AND user_id = ?';
    db.run(sql, [id, userId], function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ success: true, changes: this.changes }); });
});

app.listen(PORT, () => {
    console.log(`API Server berjalan di http://localhost:${PORT}`);
});