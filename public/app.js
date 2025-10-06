const { createApp } = Vue;

createApp({
    data() {
        return {
            // State aplikasi utama
            weeklyData: { percentage: 0, days: [] },
            currentDate: new Date(),
            isLoading: true,
            
            // State Autentikasi
            view: 'login', // Bisa 'login' atau 'register'
            token: localStorage.getItem('token') || null,
            user: {},
            loginForm: { username: '', password: '' },
            registerForm: { username: '', password: '' },
            authError: '',

            // State UI (untuk edit mode & modal)
            isEditMode: false,
            showModal: false,
            modal: {
                isEditing: false,
                dayIndex: null,
                dayOfWeek: null,
                activity: { id: null, name: '', time: '' }
            },

            // State untuk waktu WIB
            wibNow: { dateString: '', hours: 0, minutes: 0 },
        };
    },
    computed: {
        weekDisplay() {
            if (this.weeklyData.days.length === 0) return '...';
            const startDate = this.formatDate(this.weeklyData.days[0].date);
            const endDate = this.formatDate(this.weeklyData.days[6].date);
            return `${startDate} - ${endDate}`;
        }
    },
    created() {
        // Jika token tersimpan di browser, coba login otomatis
        if (this.token) {
            this.decodeToken();
            this.fetchWeekData(this.currentDate);
            this.updateWibNow();
            setInterval(this.updateWibNow, 1000);
        }
    },
    methods: {
        // === METODE AUTENTIKASI ===
        async register() {
            this.authError = '';
            try {
                const response = await fetch(window.API_BASE_URL + '/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.registerForm)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Registrasi gagal');
                alert('Registrasi berhasil! Silakan login dengan akun baru Anda.');
                this.view = 'login';
                this.registerForm = { username: '', password: '' };
            } catch (error) {
                this.authError = error.message;
            }
        },
        async login() {
            this.authError = '';
            try {
                const response = await fetch(window.API_BASE_URL + '/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.loginForm)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Login gagal');
                this.token = data.accessToken;
                localStorage.setItem('token', this.token);
                this.decodeToken();
                await this.fetchWeekData(this.currentDate);
                this.updateWibNow();
                setInterval(this.updateWibNow, 1000);
            } catch (error) {
                this.authError = error.message;
            }
        },
        logout() {
            this.token = null;
            this.user = {};
            localStorage.removeItem('token');
            this.view = 'login';
        },
        decodeToken() {
            if (!this.token) return;
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            this.user = { id: payload.id, username: payload.username };
        },
        
        // === METODE HELPER & API CALLS ===
        getAuthHeaders() {
            return {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            };
        },
        async fetchWeekData(date) {
            if (!this.token) return;
            this.isLoading = true;
            try {
                const dateString = date.toISOString().split('T')[0];
                const response = await fetch(window.API_BASE_URL + `/week-data?date=${dateString}`, {
                    headers: this.getAuthHeaders()
                });
                if (response.status === 401 || response.status === 403) return this.logout();
                this.weeklyData = await response.json();
            } catch (error) { console.error("Gagal mengambil data mingguan:", error); } 
            finally { this.isLoading = false; }
        },

        // === METODE CRUD JADWAL & FITUR ===
        async updateActivity(activity, date) {
            activity.completed = !activity.completed;
            try {
                await fetch(window.API_BASE_URL + '/update', {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({ templateId: activity.id, date: date, completed: activity.completed })
                });
                this.recalculatePercentage();
            } catch (error) {
                console.error("Gagal update aktivitas:", error);
                activity.completed = !activity.completed;
            }
        },
        toggleEditMode() {
            this.isEditMode = !this.isEditMode;
        },
        openAddModal(day, dayIndex) {
            this.modal = { isEditing: false, dayIndex, dayOfWeek: new Date(day.date + 'T00:00:00').getDay(), activity: { id: null, name: '', time: '' } };
            this.showModal = true;
        },
        openEditModal(activity, day, dayIndex) {
            this.modal = { isEditing: true, dayIndex, dayOfWeek: new Date(day.date + 'T00:00:00').getDay(), activity: { ...activity } };
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        async saveActivity() {
            const endpoint = this.modal.isEditing ? window.API_BASE_URL + `/activities/${this.modal.activity.id}` : window.API_BASE_URL + '/activities';
            const method = this.modal.isEditing ? 'PUT' : 'POST';
            const body = this.modal.isEditing ? { activity_name: this.modal.activity.name, start_time: this.modal.activity.time } : { day_of_week: this.modal.dayOfWeek, activity_name: this.modal.activity.name, start_time: this.modal.activity.time };
            try {
                const response = await fetch(endpoint, { method, headers: this.getAuthHeaders(), body: JSON.stringify(body) });
                if (!response.ok) throw new Error('Gagal menyimpan data');
                await this.fetchWeekData(this.currentDate);
                this.closeModal();
            } catch (error) { console.error("Error saving activity:", error); alert("Gagal menyimpan aktivitas."); }
        },
        async deleteActivity(activity) {
            if (!confirm(`Apakah Anda yakin ingin menghapus aktivitas "${activity.name}"?`)) return;
            try {
                const response = await fetch(window.API_BASE_URL + `/activities/${activity.id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
                if (!response.ok) throw new Error('Gagal menghapus data');
                await this.fetchWeekData(this.currentDate);
            } catch (error) { console.error("Error deleting activity:", error); alert("Gagal menghapus aktivitas."); }
        },

        // === METODE UTILITAS (WAKTU, FORMAT, DLL) ===
        changeWeek(days) {
            this.currentDate.setDate(this.currentDate.getDate() + days);
            this.fetchWeekData(this.currentDate);
        },
        isCheckable(activity, date) {
            const activityDate = new Date(date + 'T00:00:00');
            const todayDate = new Date(this.wibNow.dateString + 'T00:00:00');
            if (activityDate < todayDate) return false;
            if (activityDate.getTime() === todayDate.getTime()) {
                const [activityHours, activityMinutes] = activity.time.split(':').map(Number);
                const nowTotalMinutes = this.wibNow.hours * 60 + this.wibNow.minutes;
                const activityTotalMinutes = activityHours * 60 + activityMinutes;
                return nowTotalMinutes < activityTotalMinutes;
            }
            return true;
        },
        formatDate(dateString) {
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        },
        recalculatePercentage() {
            let totalTasks = 0, completedTasks = 0;
            this.weeklyData.days.forEach(day => { day.activities.forEach(act => { totalTasks++; if (act.completed) completedTasks++; }); });
            this.weeklyData.percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        },
        getWibTimeComponents() {
            const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
            const parts = formatter.formatToParts(new Date()).reduce((acc, part) => { if (part.type !== 'literal') acc[part.type] = part.value; return acc; }, {});
            const hours = parts.hour === '24' ? 0 : parseInt(parts.hour, 10);
            return { dateString: `${parts.year}-${parts.month}-${parts.day}`, hours, minutes: parseInt(parts.minute, 10) };
        },
        updateWibNow() {
            this.wibNow = this.getWibTimeComponents();
        },
    },
}).mount('#app');