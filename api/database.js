const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../schedule.db');

db.serialize(() => {
    // Tabel Pengguna
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )`);

    // Tabel Template Jadwal
    db.run(`CREATE TABLE IF NOT EXISTS schedule_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        activity_name TEXT NOT NULL,
        start_time TEXT NOT NULL,
        dominant INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabel Catatan Aktivitas
    db.run(`CREATE TABLE IF NOT EXISTS activity_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        template_id INTEGER NOT NULL,
        record_date TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (template_id) REFERENCES schedule_templates (id) ON DELETE CASCADE,
        UNIQUE(user_id, template_id, record_date)
    )`);
});

module.exports = db;