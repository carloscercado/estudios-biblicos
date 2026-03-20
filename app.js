const DEFAULT_CURRICULUM = [
    { id: 1, title: "Buscando a Dios" },
    { id: 2, title: "La Palabra de Dios" },
    { id: 3, title: "Discipulado" },
    { id: 4, title: "La Venida del Reino" },
    { id: 5, title: "Pecado y Arrepentimiento" },
    { id: 6, title: "Luz y Oscuridad" },
    { id: 7, title: "La Cruz" },
    { id: 8, title: "La Iglesia" }
];

const DAILY_VERSES = [
    { text: "Por tanto, vayan y hagan discípulos de todas las naciones...", ref: "Mateo 28:19 (NVI)" },
    { text: "Todo lo puedo en Cristo que me fortalece.", ref: "Filipenses 4:13 (NVI)" },
    { text: "Vayan por todo el mundo y anuncien las buenas nuevas a toda criatura.", ref: "Marcos 16:15 (NVI)" },
    { text: "Tu palabra es una lámpara a mis pies y una luz en mi camino.", ref: "Salmo 119:105 (NVI)" },
    { text: "Pero, cuando venga el Espíritu Santo sobre ustedes, recibirán poder...", ref: "Hechos 1:8 (NVI)" },
    { text: "Busquen primeramente el reino de Dios y su justicia...", ref: "Mateo 6:33 (NVI)" },
    { text: "El amor es paciente, es bondadoso. El amor no es envidioso ni jactancioso...", ref: "1 Corintios 13:4 (NVI)" }
];

const FOLLOWUP_RECOMMANDATIONS = [
    { title: "Conexión Genuina", text: "Escribe a esta persona hoy mismo preguntando cómo estuvo su día. No menciones el estudio bíblico, solo interésate genuinamente por su bienestar para fortalecer la amistad y la confianza." },
    { title: "Preparación Espiritual", text: "Antes del próximo encuentro, dedica 10 minutos a orar específicamente por la necesidad que te compartió la última vez. Dios puede poner una palabra de sabiduría fresca en tu corazón para él/ella." },
    { title: "Ánimo Inesperado", text: "Revisa tu lista de 'En Pausa' y envía un versículo que te haya hablado hoy. Un simple mensaje como 'Me acordé de ti hoy con esta promesa' puede ser la chispa que reactive su hambre espiritual." },
    { title: "Petición Directa", text: "Pregunta en tu próxima charla: '¿Cómo puedo orar por ti especialmente esta semana?'. Escucha con atención y hazle saber que estarás intercediendo en tus tiempos privados con Dios." },
    { title: "Testimonio Vivo", text: "Comparte una victoria corta o algo pequeño que Dios hizo en tu vida esta semana. Los testimonios personales son herramientas poderosas que humanizan el discipulado y aumentan la fe." },
    { title: "Ambiente Informal", text: "Invita a la persona a un café o una comida sencilla sin la presión del currículo. Estos tiempos de convivencia informal a menudo abren puertas para temas profundos que no surgen en el estudio regular." },
    { title: "Acompañamiento", text: "Si notas que la persona está pasando un momento difícil, ofrécete a acompañarla en alguna tarea cotidiana o simplemente a estar allí. El servicio práctico es el lenguaje del discipulado auténtico." }
];

const NO_APPT_SUGGESTIONS = [
    { title: "Evangelismo Intencional", text: "Pide a Dios hoy mismo que te guíe con alguien que necesite escuchar el Evangelio. Mantén tus ojos espirituales abiertos para identificar esa oportunidad única de compartir Su amor." },
    { title: "Semilla Digital", text: "Comparte un testimonio breve o un versículo que haya tocado tu corazón en tus redes sociales hoy. La Palabra de Dios no vuelve vacía y puede ser el sustento que alguien necesita leer ahora." },
    { title: "Interés Genuino", text: "Llama o escribe a un vecino o conocido solo para saludarlo y saber cómo está. Construir puentes de amistad sincera es el primer paso vital para poder compartir las buenas nuevas después." },
    { title: "Luz en el Camino", text: "Busca un momento en tu trabajo o lugar de estudio para animar con fe a un compañero que notes cansado o desanimado. Tu actitud y palabras de esperanza pueden marcar la diferencia." },
    { title: "Intercesión Estratégica", text: "Dedica un tiempo extra hoy para interceder por las personas que tienes en la lista de 'En Pausa'. Pide a Dios que ablande sus corazones y abra una puerta para retomar el estudio." },
    { title: "Mensaje de Ánimo", text: "Escribe un mensaje corto de aliento a 3 contactos que hace tiempo no saludas. Hazles saber que te acordaste de ellos y que pides bendiciones para sus vidas esta semana." }
];

const HAS_APPT_SUGGESTIONS = [
    { title: "Victoria Espiritual", text: "Recuerda que esta labor es una batalla espiritual. Antes de tu cita, asegúrate de vestirte con toda la armadura de Dios (Efesios 6:11) para enseñar con autoridad y paz." },
    { title: "Corazón Preparado", text: "Antes de tu encuentro, dedica 5 minutos exclusivos a orar por el corazón de la persona. Pide que el Espíritu Santo prepare el terreno para que la semilla de la Palabra dé mucho fruto." },
    { title: "Confianza Plena", text: "Confía totalmente en el Señor para este tiempo de enseñanza. Él ha prometido poner las palabras adecuadas en tu boca en el momento justo; tú solo sé un canal dócil de Su gracia." },
    { title: "Presencia Divina", text: "No temas ni te sientas insuficiente, porque Dios está contigo en cada palabra que compartas hoy. Su presencia es la que convence de pecado y trae consuelo verdadero al corazón." },
    { title: "Resultados de Dios", text: "Recuerda que tu misión es sembrar con amor y fidelidad, pero los resultados pertenecen exclusivamente a Dios. Descansa en Su soberanía mientras compartes Su verdad hoy." },
    { title: "Palabra con Poder", text: "Ve con fe sabiendo que la Palabra de Dios nunca vuelve vacía. Cada versículo que lean juntos tiene el poder de transformar vidas de maneras que a veces no vemos de inmediato." }
];

// --- Data Layer ---
const db = {
    get(key, defaultValue = []) {
        try { return JSON.parse(localStorage.getItem(key)) || defaultValue; }
        catch { return defaultValue; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    getPeople() { return this.get('people'); },
    getPerson(id) { return this.getPeople().find(p => p.id === id); },
    getCurriculum() {
        let curr = this.get('curriculum');
        if(!curr || curr.length === 0) {
            curr = DEFAULT_CURRICULUM;
            this.set('curriculum', curr);
        }
        return curr;
    },
    addStudyToCurriculum(title) {
        let curr = this.getCurriculum();
        const nextId = curr.length ? Math.max(...curr.map(c=>c.id)) + 1 : 1;
        curr.push({ id: nextId, title });
        this.set('curriculum', curr);
    },
    savePerson(person) {
        const people = this.getPeople();
        if (person.id) {
            const index = people.findIndex(p => p.id === person.id);
            if(index !== -1) people[index] = person;
            else people.push(person);
        } else {
            person.id = Date.now().toString();
            person.startDate = person.startDate || new Date().toISOString();
            person.status = 'ACTIVO';
            person.studies = person.studies || [];
            person.nextAppointment = null;
            person.location = '';
            person.appointmentType = 'ESTUDIO';
            person.appointmentStudyId = 1;
            person.isFake = false;
            people.push(person);
        }
        this.set('people', people);
    },
    addStudyRecord(personId, studyId, notes) {
        const p = this.getPerson(personId);
        if(p) {
            p.studies.push({ studyId, date: new Date().toISOString(), notes });
            p.nextAppointment = null;
            p.location = '';
            p.appointmentType = '';
            p.appointmentStudyId = null;
            p.notified = false;

            // Check if all studies in curriculum are done
            const curr = this.getCurriculum();
            const completedIds = p.studies.map(s => s.studyId);
            const allDone = curr.every(c => completedIds.includes(c.id));
            if(allDone) {
                p.status = 'TERMINADO';
            }
            this.savePerson(p);
        }
    },
    setNextAppointment(personId, datetime, location = '', type = 'ESTUDIO', studyId = null) {
        const p = this.getPerson(personId);
        if(p) { 
            p.nextAppointment = datetime; 
            p.location = location; 
            p.appointmentType = type;
            p.appointmentStudyId = studyId;
            p.notified = false;
            
            // Automatic reset from CANCELADO to ACTIVO
            if (p.status === 'CANCELADO') {
                p.status = 'ACTIVO';
            }

            this.savePerson(p); 
        }
    },
    changeStatus(personId, newStatus) {
        const p = this.getPerson(personId);
        if(p) { p.status = newStatus; this.savePerson(p); }
    },
    deletePerson(personId) {
        let people = this.getPeople();
        people = people.filter(p => p.id !== personId);
        this.set('people', people);
    },
    deleteFakeData() {
        let people = this.getPeople();
        people = people.filter(p => !p.isFake);
        this.set('people', people);
    },
    cancelAppointment(personId) {
        const p = this.getPerson(personId);
        if(p) {
            p.nextAppointment = null;
            p.location = '';
            this.savePerson(p);
        }
    }
};

// --- Utilities ---
const utils = {
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return { text: "Buenos días", emoji: "☀️" };
        if (hour < 19) return { text: "Buenas tardes", emoji: "🌤️" };
        return { text: "Buenas noches", emoji: "🌙" };
    },
    formatDate(isoString) {
        if(!isoString) return 'Sin fecha';
        const d = new Date(isoString);
        return d.toLocaleDateString('es-MX', { day:'2-digit', month:'short' });
    },
    formatTime(isoString) {
        if(!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit', hour12: true }).toUpperCase();
    },
    daysSince(isoString) {
        if(!isoString) return 999;
        const ms = Date.now() - new Date(isoString).getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    },
    cleanPhone(phone) { return phone.replace(/\D/g, ''); },
    toLocalDatetimeValue(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = n => n < 10 ? '0' + n : n;
        return d.getFullYear() + '-' + 
               pad(d.getMonth() + 1) + '-' + 
               pad(d.getDate()) + 'T' + 
               pad(d.getHours()) + ':' + 
               pad(d.getMinutes());
    },
    getNextStudy(person) {
        const curr = db.getCurriculum();
        const completedIds = person.studies.map(s => s.studyId);
        return curr.find(c => !completedIds.includes(c.id)) || null;
    },
    getGoogleCalendarUrl(person, datetime, location, type, studyId) {
        const start = new Date(datetime);
        const end = new Date(start.getTime() + 60 * 60000); // Always 1 hour
        
        const formatGDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        
        let title = `${type}: ${person.name}`;
        if (type === 'ESTUDIO' && studyId) {
            const curriculum = db.getCurriculum();
            const study = curriculum.find(s => s.id === studyId);
            if (study) {
                title = `Estudio: ${study.title} - ${person.name}`;
            }
        } else if (type === 'TIEMPO DE ÁNIMO') {
            title = `Ánimo: ${person.name}`;
        }

        const details = `Lugar: ${location || 'No especificado'}\nPersona: ${person.name}\nWhatsApp: ${person.phone}\n\n*Recuerda pedir sabiduría para enseñar con amor.`;
        
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGDate(start)}/${formatGDate(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location || '')}`;
    }
};

// --- Main App Logic ---
const app = {
    currentView: 'dashboard',
    state: {
        currentTab: 'home',
        dailySugg: null,
    },
    
    init() {
        app.state.currentTab = 'home';
        
        // Handle Visibility Change for Daily Recommendation
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                app.utils.refreshDailySugg();
                app.render(); // Assuming app.render() exists and re-renders the current view
            }
        });

        // Initialize Daily Suggestion
        const storedSugg = localStorage.getItem('dailySugg');
        if (storedSugg) {
            app.state.dailySugg = JSON.parse(storedSugg);
        } else {
            app.utils.refreshDailySugg();
        }

        if(!localStorage.getItem('app_initialized') && db.getPeople().length === 0) {
            localStorage.setItem('app_initialized', 'true');
            const names = ["Carlos Mendoza", "Lucía Fernanda", "Jorge Ramírez", "Sofía Vargas", "Mateo Silva"];
            const msInDay = 86400000;
            const now = Date.now();
            names.forEach((name, i) => {
                const id = "10" + i;
                let stat = 'ACTIVO';
                let nextAppt = null;
                let pastDays = 5;
                if(i === 0) nextAppt = new Date(now + msInDay).toISOString().slice(0,16);
                if(i === 1) nextAppt = new Date(now + msInDay * 2).toISOString().slice(0,16);
                if(i === 2) { nextAppt = null; stat = 'EN PAUSA'; pastDays = 10; }
                if(i === 3) nextAppt = new Date(now + 3600000).toISOString().slice(0,16); 
                if(i === 4) { nextAppt = null; stat = 'CANCELADO'; }
                
                db.savePerson({ 
                    id, name, phone: "555000000" + i, 
                    startDate: new Date(now - pastDays * msInDay).toISOString(), 
                    status: stat, 
                    studies: [], 
                    nextAppointment: nextAppt ? new Date(nextAppt).toISOString() : null, 
                    location: nextAppt ? "Reunión por verificar" : "", 
                    appointmentType: 'ESTUDIO',
                    appointmentStudyId: 1,
                    isFake: true
                });
            });
        }
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(err => console.error('SW Error:', err));
        }
        
        this.navigate('dashboard');
        
        // No longer using notification automations
    },

    utils: {
        refreshDailySugg() {
            const all = [...NO_APPT_SUGGESTIONS, ...HAS_APPT_SUGGESTIONS, ...FOLLOWUP_RECOMMANDATIONS];
            const pick = all[Math.floor(Math.random() * all.length)];
            // Handle both string and object recommendations
            const final = typeof pick === 'string' ? { title: "Sugerencia estratégica", text: pick.replace(/\*\*/g, '') } : pick;
            app.state.dailySugg = final;
            localStorage.setItem('dailySugg', JSON.stringify(final));
        }
    },

    checkAutomations() {
        // Cleaning up unused notification logic
    },

    showNotification(title, body) {
        // Function deprecated as per user request
    },

    navigate(view, data = null) {
        this.currentView = view;
        
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active');
            let icon = el.querySelector('ion-icon');
            if(icon && !el.classList.contains('add-fab')) {
               let name = icon.getAttribute('name').replace('-outline','');
               icon.setAttribute('name', name + '-outline');
            }
        });
        
        const navBtn = document.querySelector(`.nav-item[onclick*="${view}"]`);
        if(navBtn && !navBtn.classList.contains('add-fab')) {
            navBtn.classList.add('active');
            let icon = navBtn.querySelector('ion-icon');
            if(icon) icon.setAttribute('name', icon.getAttribute('name').replace('-outline',''));
        }
        
        const titleData = this.getTitle(view);
        document.getElementById('header-title').innerHTML = `<ion-icon class="header-icon" name="${titleData.icon}"></ion-icon><span>${titleData.name}</span>`;
        
        const container = document.getElementById('view-container');
        container.innerHTML = views[view] ? views[view](data) : '<h1>404</h1>';
        window.scrollTo(0,0);
        
        this.checkAutomations();
    },
    
    getTitle(view) {
        const titles = { 
            dashboard: { name: 'Sigueme', icon: 'home' },
            people: { name: 'Personas', icon: 'people' },
            'add-person': { name: 'Nueva Persona', icon: 'person-add' },
            agenda: { name: 'Agenda', icon: 'calendar' },
            settings: { name: 'Ajustes', icon: 'cog' },
            detail: { name: 'Perfil', icon: 'id-card' },
            newsession: { name: 'Registrar un tiempo', icon: 'time' }
        };
        return titles[view] || {name: 'App', icon: 'apps'};
    },

    showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: var(--text-main); color: var(--bg-primary); padding: 14px 24px; border-radius: 20px;
            margin-bottom: 12px; font-size: 14px; font-weight: 500; text-align: center;
            animation: slideUp 0.3s, fadeOut 0.3s 2.7s forwards; box-shadow: var(--shadow-md); position: absolute; top: 16px; left: 50%; transform: translateX(-50%); z-index: 1000;
        `;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    handlers: {
        saveNewPerson() {
            const name = document.getElementById('p-name').value.trim();
            const phone = document.getElementById('p-phone').value.trim();
            if(!name || !phone) return app.showToast('Completa los campos obligatorios.');
            db.savePerson({ name, phone });
            app.showToast('Persona registrada (Activa)');
            app.navigate('people');
        },
        saveSession(personId) {
            const studyId = document.getElementById('s-study').value;
            const notes = document.getElementById('s-notes').value.trim();
            const numStudyId = parseInt(studyId);
            db.addStudyRecord(personId, isNaN(numStudyId) ? 0 : numStudyId, notes);
            app.showToast('Tiempo registrado con éxito');
            app.navigate('detail', personId);
        },
        saveAppointment(personId) {
            const datetime = document.getElementById('a-datetime').value;
            const originalDate = document.getElementById('a-datetime').dataset.original;
            const location = document.getElementById('a-location').value.trim();
            const type = document.getElementById('a-type').value;
            let studyId = null;
            if(type === 'ESTUDIO') {
                const sEl = document.getElementById('a-study');
                if(sEl) studyId = parseInt(sEl.value);
            }

            if(!datetime) return app.showToast('Elige fecha y hora');

            const targetIso = new Date(datetime).toISOString();
            const targetStr = targetIso.slice(0, 16);
            const clash = db.getPeople().find(p => p.id !== personId && p.nextAppointment && p.nextAppointment.slice(0, 16) === targetStr);
            if(clash) {
                return app.showToast(`Hora ya ocupada por ${clash.name}.`);
            }

            const person = db.getPerson(personId);
            db.setNextAppointment(personId, targetIso, location, type, studyId);
            
            // Only open GCal if date/time changed
            const isDateChanged = targetIso !== originalDate;
            
            if (isDateChanged) {
                const gCalUrl = utils.getGoogleCalendarUrl(person, targetIso, location, type, studyId);
                app.showToast('Actualizando Google Calendar...');
                app.navigate('agenda');
                setTimeout(() => {
                    window.open(gCalUrl, '_blank');
                }, 500);
            } else {
                app.showToast('Cambios guardados');
                app.navigate('agenda');
            }
        },
        cancelAppointment(personId) {
            if(confirm('¿Deseas cancelar esta cita?')) {
                db.cancelAppointment(personId);
                app.showToast('Cita cancelada');
                app.navigate(app.currentView === 'agenda' ? 'agenda' : 'detail', personId);
            }
        },
        markAsDone(personId) {
            const p = db.getPerson(personId);
            if(!p || !p.nextAppointment) return;

            const studyId = (p.appointmentType === 'ESTUDIO' && p.appointmentStudyId) ? p.appointmentStudyId : 0;
            const locationNote = p.location ? ` en ${p.location}` : '';
            
            let typeNote = 'Tiempo de ánimo';
            if (p.appointmentType === 'ESTUDIO') {
                const currItem = db.getCurriculum().find(c => c.id === studyId);
                typeNote = currItem ? `Estudio: ${currItem.title}` : 'Estudio';
            }
            
            const notes = `${typeNote} realizado el ${utils.formatDate(p.nextAppointment)}${locationNote}.`;

            db.addStudyRecord(personId, studyId, notes);
            
            const updatedP = db.getPerson(personId);
            if(updatedP.status === 'TERMINADO') {
                app.showToast('¡Felicidades! Todo TERMINADO');
            } else {
                app.showToast('Cita registrada correctamente');
            }

            app.navigate('agenda');
        },
        updateLastStudyNotes(personId, newNotes) {
            const p = db.getPerson(personId);
            if(p && p.studies.length > 0) {
                p.studies[p.studies.length - 1].notes = newNotes;
                db.savePerson(p);
                app.showToast('Notas actualizadas');
                app.navigate('detail', personId);
            }
        },
        openWhatsApp(phone, message = '') {
            const clean = utils.cleanPhone(phone);
            const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
            window.location.href = url;
        },
        changeStatus(personId, value) {
            if(!value) return;
            db.changeStatus(personId, value);
            app.showToast('Estado actualizado a ' + value);
            app.navigate('detail', personId);
        },
        deletePerson(personId) {
            if(confirm('¿Estás seguro de eliminar a esta persona? Todo su progreso será destruido.')) {
                db.deletePerson(personId);
                app.showToast('Persona eliminada permanentemente.');
                app.navigate('people');
            }
        },
        deleteFakeData() {
            if(confirm('¿Eliminar todos los datos de prueba iniciales? Tus registros reales se mantendrán.')) {
                db.deleteFakeData();
                app.showToast('Datos de prueba eliminados.');
                app.navigate('settings');
            }
        },
        addStudySetting() {
            const title = document.getElementById('set-study-title').value.trim();
            if(!title) return;
            db.addStudyToCurriculum(title);
            app.showToast('Estudio agregado');
            app.navigate('settings');
        }
    }
};

// --- View Renderers ---
const views = {
    dashboard() {
        let storedIndex = parseInt(localStorage.getItem('dailyVerseIndex') || 0);
        let storedDate = localStorage.getItem('dailyVerseDate');
        const todayStr = new Date().toDateString();
        if(storedDate !== todayStr) {
            storedIndex = Math.floor(Math.random() * DAILY_VERSES.length);
            localStorage.setItem('dailyVerseIndex', storedIndex);
            localStorage.setItem('dailyVerseDate', todayStr);
        }
        const verse = DAILY_VERSES[storedIndex] || DAILY_VERSES[0];
        
        const people = db.getPeople();
        const activeCount = people.filter(p => p.status === 'ACTIVO').length;
        
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 86400000);
        const weeklyAppointments = people.filter(p => p.nextAppointment && new Date(p.nextAppointment) >= now && new Date(p.nextAppointment) <= nextWeek).length;

        const suggestionHtml = `
            <div class="section-title">Enfoque de hoy</div>
            <div class="card suggestion-item" style="padding:24px; border-left: 5px solid var(--accent); display:block; width:100%; box-sizing:border-box; margin-bottom:20px;">
                <div style="font-size:13px; color:var(--accent); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">${app.state.dailySugg?.title || 'Sugerencia'}</div>
                <div style="font-size:16px; color:var(--text-main); line-height:1.6; width:100%; font-weight:400;">${app.state.dailySugg?.text || ''}</div>
            </div>
        `;

        return `
            <header class="header">
                <h1 style="letter-spacing:2px;">SÍGUEME</h1>
                <p>Discípulos que permanecen</p>
            </header>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:24px;">
                <div class="card" style="flex:1; margin:0; text-align:center; cursor:pointer; padding:20px; border:1px solid var(--glass-border);" 
                     onclick="${activeCount > 0 ? "app.navigate('people')" : ""}">
                   <div style="font-size:28px; font-weight:800; color:var(--accent); margin-bottom:4px;">${activeCount}</div>
                   <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.3px;">Discípulos Activos</div>
                </div>
                <div class="card" style="flex:1; margin:0; text-align:center; cursor:pointer; padding:20px; border:1px solid var(--glass-border);" 
                     onclick="${weeklyAppointments > 0 ? "app.navigate('agenda')" : ""}">
                   <div style="font-size:28px; font-weight:800; color:var(--success); margin-bottom:4px;">${weeklyAppointments}</div>
                   <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.3px;">Citas en la Semana</div>
                </div>
            </div>

            <div class="verse-card" style="margin-bottom:24px; background:var(--bg-secondary);">
                <div class="verse-text" style="font-style:italic; opacity:0.9;">"${verse.text}"</div>
                <div class="verse-ref" style="font-weight:700; color:var(--accent);">${verse.ref}</div>
            </div>

            ${suggestionHtml}
        `;
    },
    
    people() {
         const people = db.getPeople();
         let html = `<div class="section-title">Directorio</div>`;
         if(people.length === 0) return html + `<div class="card">No hay personas registradas.</div>`;
         
         const curriculumCache = db.getCurriculum();
         // Sort by startDate - Newest first (Los últimos agregados arriba)
         people.sort((a,b) => new Date(b.startDate) - new Date(a.startDate));
         
         html += people.map(p => {
             const statusClass = p.status === 'TERMINADO' ? 'status-terminado' : (p.status === 'CANCELADO' ? 'status-cancelado' : '');
             return `
             <div class="person-item ${statusClass}" onclick="app.navigate('detail', '${p.id}')">
                 <div class="person-avatar">${p.name.charAt(0).toUpperCase()}</div>
                 <div class="person-info">
                     <div class="person-name">${p.name}</div>
                     <div class="person-meta">${p.status} • Lecciones: ${p.studies.length}/${curriculumCache.length}</div>
                 </div>
                 <ion-icon name="chevron-forward" style="color:var(--text-muted); font-size:18px;"></ion-icon>
             </div>
         `}).join('');
         return html;
    },

    'add-person': function() {
       return `
          <div class="card">
             <div class="form-group">
                <label class="form-label">Nombre Completo</label>
                <input type="text" id="p-name" class="form-input" placeholder="Ej. Juan Pérez">
             </div>
             <div class="form-group">
                <label class="form-label">WhatsApp o Teléfono</label>
                <input type="tel" id="p-phone" class="form-input" placeholder="+52 1 234 567 8900">
             </div>
             <button class="btn-primary" onclick="app.handlers.saveNewPerson()">Guardar Perfil</button>
          </div>
       `;
    },

    detail(id) {
        const p = db.getPerson(id);
        if(!p) return `<div>Error</div>`;
        const nextStudy = utils.getNextStudy(p);
        const curr = db.getCurriculum();
        const firstName = p.name.split(' ')[0];
        const greeting = utils.getGreeting();

        return `
            <div class="card" style="display:flex; align-items:center; margin-bottom: 20px;">
                <div style="min-width:64px;width:64px;height:64px;background:var(--accent);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;">
                    ${p.name.charAt(0).toUpperCase()}
                </div>
                <div style="flex:1; margin-left:14px; overflow:hidden;">
                    <h2 style="font-size:20px; font-weight:600; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</h2>
                    <div style="font-size:14px; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Estado: ${p.status}</div>
                </div>
                <button class="whatsapp-btn" onclick="app.handlers.openWhatsApp('${p.phone}', 'Hola ${firstName}...')"><ion-icon name="logo-whatsapp"></ion-icon></button>
            </div>

            <div class="card" style="background:var(--accent-light); border:0; padding:16px;">
                <div style="font-weight:600; font-size:13px; color:var(--accent); margin-bottom:6px; text-transform:uppercase;">Próximo Paso Sugerido</div>
                ${nextStudy 
                    ? `<p style="font-size:15px; margin-bottom: 12px; font-weight:500;">Estudiar: <strong>${nextStudy.title}</strong></p>
                       <button onclick="app.handlers.openWhatsApp('${p.phone}', 'Hola ${firstName}, ${greeting.text} ${greeting.emoji}. ¿Cómo estás?')" style="background:var(--bg-secondary); border:0; color:var(--accent); padding:10px 16px; border-radius:10px; font-size:15px; font-weight:600; width:100%;">Enviar Mensaje para Agendar</button>`
                    : `<p style="font-size:15px; margin-bottom: 0; font-weight:500;">¡Ha completado todo el currículo base!</p>`
                }
            </div>
            
            <button class="btn-primary" style="margin-bottom:20px;" onclick="app.navigate('newsession', '${p.id}')"><ion-icon name="pencil"></ion-icon> Registrar un tiempo</button>

            <div class="section-title">Historial</div>
            ${p.studies.length === 0 ? `<div class="card text-center" style="color:var(--text-muted);">Sin tiempos registrados.</div>` : 
              [...p.studies].reverse().map((s, idx) => {
                  const isLast = idx === 0;
                  const scurr = curr.find(c => c.id === s.studyId);
                  const titleStr = s.studyId === 0 ? "Tiempo de ánimo" : (scurr ? scurr.title : 'Estudio');
                  
                  return `
                      <div class="card history-item">
                          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                              <div style="flex:1;">
                                  <div style="font-weight:600; font-size:15px; color:var(--text-main);">${titleStr}</div>
                                  <div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">${utils.formatDate(s.date)}</div>
                                  ${isLast ? 
                                     `<div contenteditable="true" class="minimal-edit" onblur="app.handlers.updateLastStudyNotes('${p.id}', this.innerText)">${s.notes || 'Añadir notas...'}</div>`
                                     : `<div style="font-size:14px; color:var(--text-muted);">${s.notes || 'Sin notas.'}</div>`
                                  }
                              </div>
                              ${isLast ? `<ion-icon name="create-outline" style="color:var(--accent); font-size:18px;"></ion-icon>` : ''}
                          </div>
                      </div>`
              }).join('')
            }

            <div class="section-title">Agendar Próxima</div>
            <div class="card" id="detail-agenda-card">
                ${p.nextAppointment ? `<div style="margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid var(--glass-border); font-size:14px;"><strong>Cita actual (${p.appointmentType}):</strong> ${utils.formatDate(p.nextAppointment)} - ${utils.formatTime(p.nextAppointment)}<br><span style="color:var(--text-muted); font-size:13px;"><ion-icon name="location-outline" style="vertical-align:middle;"></ion-icon> ${p.location||'Sin ubicación'}</span></div>` : ''}
                <div class="form-group">
                    <label class="form-label">Tipo de Cita</label>
                    <select id="a-type" class="form-select" onchange="document.getElementById('a-study-container').style.display = this.value === 'ESTUDIO' ? 'block':'none'">
                        <option value="ESTUDIO" ${p.appointmentType==='ESTUDIO'?'selected':''}>Estudio Bíblico</option>
                        <option value="TIEMPO DE ÁNIMO" ${p.appointmentType==='TIEMPO DE ÁNIMO'?'selected':''}>Tiempo de Ánimo</option>
                    </select>
                </div>
                
                <div id="a-study-container" class="form-group" style="display:${p.appointmentType==='ESTUDIO'?'block':'none'};">
                     <label class="form-label">Lección a impartir</label>
                     <select id="a-study" class="form-select">
                        ${curr.map(c => `<option value="${c.id}" ${p.appointmentStudyId==c.id?'selected':''}>${c.title}</option>`).join('')}
                     </select>
                </div>

                <div class="form-group">
                    <label class="form-label">¿Cuándo?</label>
                    <input type="datetime-local" id="a-datetime" class="form-input" 
                           data-original="${p.nextAppointment || ''}"
                           value="${utils.toLocalDatetimeValue(p.nextAppointment)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Lugar o Link</label>
                    <input type="text" id="a-location" class="form-input" placeholder="Ej. Cafetería, Zoom..." value="${p.location}">
                </div>
                <button class="btn-primary" style="padding:12px; font-size:15px;" onclick="app.handlers.saveAppointment('${p.id}')">Guardar Cita</button>
            </div>
            
            <div style="margin-top:40px; border-top: 1px solid var(--glass-border); padding-top:20px; padding-bottom: 20px;">
                ${p.status !== 'CANCELADO' ? `<button class="btn-primary btn-danger" style="background:var(--danger); color:white; margin-bottom:12px;" onclick="if(confirm('¿Confirmas que deseas clasificar a esta persona como abandono de estudios?')) app.handlers.changeStatus('${p.id}', 'CANCELADO')">Abandonó los estudios</button>` : ''}
                <button class="btn-primary btn-danger" style="background:transparent; color:var(--danger); box-shadow:none; border: 1px solid var(--danger);" onclick="app.handlers.deletePerson('${p.id}')">Eliminar Persona</button>
            </div>
        `;
    },

    newsession(personId) {
        const p = db.getPerson(personId);
        const curr = db.getCurriculum();
        const completedIds = p.studies.map(s => s.studyId);
        let options = curr.map(c => `<option value="${c.id}" ${completedIds.includes(c.id)?'disabled':''}>${completedIds.includes(c.id)?'✅':''} ${c.title}</option>`).join('');
        return `
            <div class="card">
                <h3 style="margin-bottom: 20px; font-weight:600;">Tiempo con ${p.name.split(' ')[0]}</h3>
                <div class="form-group">
                    <label class="form-label">Lección o Tema</label>
                    <select id="s-study" class="form-select">
                        <option value="0">✅ Sólo tiempo de ánimo / conviviencia</option>
                        ${options}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Notas y Desarrollo</label>
                    <textarea id="s-notes" class="form-textarea" rows="4" placeholder="Observaciones, dudas, o peticiones de oración..."></textarea>
                </div>
                <button class="btn-primary" style="margin-bottom:12px;" onclick="app.handlers.saveSession('${p.id}')">Guardar Registro</button>
                <button class="btn-primary btn-danger" onclick="app.navigate('detail', '${p.id}')">Cancelar</button>
            </div>`;
    },

    agenda() {
        const people = db.getPeople(); let items = [];
        people.forEach(p => { if(p.nextAppointment) items.push({p, date: new Date(p.nextAppointment)}); });
        items.sort((a,b) => a.date - b.date);

        let html = `<div class="section-title">Calendario</div>`;
        if(items.length===0) return html + `<div class="card text-center">Sin eventos agendados.</div>`;

        const curr = db.getCurriculum();

        html += items.map(item => {
            const isPast = item.date < new Date();
            const accent = isPast ? 'var(--warning)' : 'var(--accent)';
            let aptDetails = item.p.appointmentType;
            if (item.p.appointmentType === 'ESTUDIO' && item.p.appointmentStudyId) {
                const sItem = curr.find(x => x.id === item.p.appointmentStudyId);
                aptDetails += sItem ? ` (${sItem.title})` : '';
            }
            const firstName = item.p.name.split(' ')[0];
            const timeStr = utils.formatTime(item.date);
            
            return `
            <div class="card" style="border-left: 4px solid ${accent}" onclick="app.navigate('detail', '${item.p.id}')">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <strong style="font-size:16px;">${item.p.name}</strong>
                    <span style="font-size:13px; font-weight:600; color:${accent}">${utils.formatDate(item.date)} ${timeStr}</span>
                </div>
                <div style="font-size:13px; color:var(--text-main); font-weight:500; margin-bottom:4px;">
                    ${aptDetails}
                </div>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">
                    <ion-icon name="location-outline" style="vertical-align:text-bottom;"></ion-icon> ${item.p.location || 'Por definir'}
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="btn-success" style="padding:8px 12px; font-size:13px; flex:1;" onclick="event.stopPropagation(); app.handlers.openWhatsApp('${item.p.phone}', 'Hola ${firstName}, nos vemos en nuestro tiempo a las ${timeStr}.')"><ion-icon name="logo-whatsapp"></ion-icon> Avisar</button>
                    <button class="btn-secondary" style="padding:8px 12px; font-size:13px; flex:1;" onclick="event.stopPropagation(); app.navigate('detail', '${item.p.id}'); setTimeout(()=>document.getElementById('detail-agenda-card').scrollIntoView(), 100);"><ion-icon name="pencil-outline"></ion-icon> Editar</button>
                    <button class="btn-danger" style="padding:8px 12px; font-size:13px; flex:1;" onclick="event.stopPropagation(); app.handlers.cancelAppointment('${item.p.id}')"><ion-icon name="close-circle-outline"></ion-icon> Cancelar</button>
                    ${isPast ? `<button class="btn-primary" style="padding:10px; font-size:14px; flex:100%; margin-top:5px;" onclick="event.stopPropagation(); app.handlers.markAsDone('${item.p.id}')"><ion-icon name="checkmark-circle-outline"></ion-icon> Marcar como Listo</button>` : ''}
                </div>
            </div>`
        }).join('');
        return html;
    },

    settings() {
        const curr = db.getCurriculum();
        return `
            <div class="card text-center" style="padding:20px;">
                <ion-icon name="book" style="font-size:48px; color:var(--accent); margin-bottom:16px;"></ion-icon>
                <h2 style="font-size:20px; font-weight:600; margin-bottom:8px;">Ajustes de Sigueme</h2>
                <div style="margin-top:16px; text-align:left; font-size:14px; line-height:1.5;">
                    <strong>PWA instalable:</strong><br>
                    Para instalar en Android: Toca el menú de 3 puntos (⋮) en Chrome y selecciona <strong>"Instalar aplicación"</strong>.<br><br>
                    Para iOS: Toca el botón <strong>Compartir</strong> > <strong>Añadir a pantalla de inicio</strong>.
                </div>
            </div>
            
            <div class="section-title">Currículum de Estudios</div>
            <div class="card">
                ${curr.map(c => `
                    <div class="list-item-action">
                        <span style="font-weight:500;">${c.id}. ${c.title}</span>    
                    </div>
                `).join('')}
                <div style="margin-top:20px; border-top:1px solid var(--glass-border); padding-top:20px;">
                    <div class="form-group">
                        <label class="form-label">Añadir Nuevo Tema</label>
                        <input type="text" id="set-study-title" class="form-input" placeholder="Título del estudio">
                    </div>
                    <button class="btn-primary" style="padding:10px;" onclick="app.handlers.addStudySetting()">Agregar Estudio</button>
                </div>
            </div>

            <div class="card" style="margin-top:40px; text-align:center; background:var(--danger-light);">
                <div style="color:var(--danger); font-weight:600; margin-bottom:12px; font-size:14px;">Zona de Datos de Prueba</div>
                <button class="btn-primary btn-danger" style="background:var(--danger); color:white;" onclick="app.handlers.deleteFakeData()">
                    <ion-icon name="trash"></ion-icon> Borrar Datos FAKE (Prueba)
                </button>
                <p style="font-size:11px; margin-top:8px; color:var(--danger);">Esto solo eliminará los 5 perfiles iniciales de ejemplo.</p>
            </div>

             <div class="card" style="margin-top:20px; text-align:center;">
                <button class="btn-primary btn-danger" style="background:transparent; color:var(--danger); border: 1px solid var(--danger); box-shadow:none;" onclick="if(confirm('¿Estás SEGURO de borrar TODO? Se perderán tus datos reales también.')) { localStorage.clear(); window.location.reload(); }">
                    <ion-icon name="alert-circle"></ion-icon> Borrar TODO (Reset Total)
                </button>
            </div>
            `;
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
