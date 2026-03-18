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
    { text: "A la verdad, no me avergüenzo del evangelio, pues es poder de Dios...", ref: "Romanos 1:16 (NVI)" },
    { text: "Vayan por todo el mundo y anuncien las buenas nuevas a toda criatura.", ref: "Marcos 16:15 (NVI)" },
    { text: "Ahora bien, ¿cómo invocarán a aquel en quien no han creído?...", ref: "Romanos 10:14 (NVI)" },
    { text: "Pero, cuando venga el Espíritu Santo sobre ustedes, recibirán poder...", ref: "Hechos 1:8 (NVI)" }
];

const URGENT_ACTIVITIES = [
    "Comparte tu fe a través de tus redes sociales (Estado o Historia).",
    "Invita a un vecino o amigo cercano a estudiar la biblia.",
    "Comparte tu fe con algún compañero de trabajo o escuela.",
    "Escribe un mensaje de ánimo espiritual a 3 contactos de tu teléfono.",
    "Llama a alguien de la iglesia para animarle y orar juntos."
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
            people.push(person);
        }
        this.set('people', people);
    },
    addStudyRecord(personId, studyId, notes) {
        const p = this.getPerson(personId);
        if(p) {
            p.studies.push({ studyId, date: new Date().toISOString(), notes });
            p.nextAppointment = null; // Clean up since met
            this.savePerson(p);
        }
    },
    setNextAppointment(personId, datetime, location = '', type = 'ESTUDIO') {
        const p = this.getPerson(personId);
        if(p) { 
            p.nextAppointment = datetime; 
            p.location = location; 
            p.appointmentType = type;
            this.savePerson(p); 
        }
    },
    changeStatus(personId, newStatus) {
        const p = this.getPerson(personId);
        if(p) { p.status = newStatus; this.savePerson(p); }
    }
};

// --- Utilities ---
const utils = {
    formatDate(isoString) {
        if(!isoString) return 'Sin fecha';
        const d = new Date(isoString);
        return d.toLocaleDateString('es-MX', { day:'2-digit', month:'short' });
    },
    formatTime(isoString) {
        if(!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' });
    },
    daysSince(isoString) {
        if(!isoString) return 999;
        const ms = Date.now() - new Date(isoString).getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    },
    cleanPhone(phone) { return phone.replace(/\D/g, ''); },
    getNextStudy(person) {
        const curr = db.getCurriculum();
        const completedIds = person.studies.map(s => s.studyId);
        return curr.find(c => !completedIds.includes(c.id)) || null;
    }
};

// --- Main App Logic ---
const app = {
    currentView: 'dashboard',
    
    init() {
        if(db.getPeople().length === 0) {
            db.savePerson({ id: "101", name: "Ana López", phone: "5551234567", startDate: new Date(Date.now() - 30 * 86400000).toISOString(), status: 'ACTIVO', studies: [ { studyId: 1, date: new Date(Date.now() - 2 * 86400000).toISOString(), notes: "" } ], nextAppointment: new Date(Date.now() + 2 * 86400000).toISOString(), location: "Cafetería Central", appointmentType: 'ESTUDIO' });
        }
        
        if ('Notification' in window && navigator.serviceWorker) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
        
        this.checkAutomations();
        this.navigate('dashboard');
    },

    checkAutomations() {
        const people = db.getPeople();
        let changed = false;
        people.forEach(p => {
            // Automation: 24h passed, status ACTIVO, no history, no appointments -> PAUSA
            if (p.status === 'ACTIVO' && p.studies.length === 0 && !p.nextAppointment) {
                if (utils.daysSince(p.startDate) >= 1) { 
                    p.status = 'EN PAUSA';
                    db.savePerson(p);
                    changed = true;
                    if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
                        navigator.serviceWorker.ready.then(reg => {
                            reg.showNotification('Discipulado: Aviso Importante', {
                                body: `${p.name} se movió a "EN PAUSA" porque pasaron 24h sin seguimiento. Agéndalo pronto.`,
                                icon: '/icon-192x192.png'
                            });
                        });
                    }
                }
            }
        });
        if(changed && this.currentView === 'people') this.navigate('people');
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
        
        const locationInput = document.getElementById('a-location');
        if (locationInput && window.google && google.maps && google.maps.places) {
            new google.maps.places.Autocomplete(locationInput, { fields: ["formatted_address", "name"], types: ["geocode", "establishment"] });
        }
    },
    
    getTitle(view) {
        const titles = { 
            dashboard: { name: 'Inicio', icon: 'home' },
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
            // studyId 0 acts as "Just encouragement / no study lesson"
            const numStudyId = parseInt(studyId);
            db.addStudyRecord(personId, isNaN(numStudyId) ? 0 : numStudyId, notes);
            app.showToast('Tiempo registrado con éxito');
            app.navigate('detail', personId);
        },
        saveAppointment(personId) {
            const datetime = document.getElementById('a-datetime').value;
            const location = document.getElementById('a-location').value.trim();
            const type = document.getElementById('a-type').value;
            if(!datetime) return app.showToast('Elige fecha y hora');
            db.setNextAppointment(personId, new Date(datetime).toISOString(), location, type);
            
            // Notification
            if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification('Cita programada', {
                        body: `Cita (${type}) con ${db.getPerson(personId).name} a las ${utils.formatTime(new Date(datetime))} en ${location || 'ubicación pte.'}.`,
                        icon: '/icon-192x192.png'
                    });
                });
            }

            app.showToast('Cita guardada correctamente');
            if(app.currentView !== 'agenda') app.navigate('detail', personId);
            else app.navigate('agenda');
        },
        openWhatsApp(phone, message = '') {
            const clean = utils.cleanPhone(phone);
            const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
            // Bug Fix: replace window.open(url, '_blank') with window.location.href
            window.location.href = url;
        },
        changeStatus(personId, value) {
            if(!value) return;
            db.changeStatus(personId, value);
            app.showToast('Estado actualizado a ' + value);
            app.navigate('detail', personId);
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
        // Dynamic Verse
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
        let todayAppointments = 0;

        people.forEach(p => {
            if(p.nextAppointment && new Date(p.nextAppointment).toDateString() === new Date().toDateString()) todayAppointments++;
        });

        // Urgent Actions (Evangelism Recommendations) if no appointments today
        let urgentHtml = '';
        if(todayAppointments === 0) {
            let urgentTaskIndex = parseInt(localStorage.getItem('urgentTaskIndex') || 0);
            if(storedDate !== todayStr) {
                urgentTaskIndex = Math.floor(Math.random() * URGENT_ACTIVITIES.length);
                localStorage.setItem('urgentTaskIndex', urgentTaskIndex);
            }
            urgentHtml = `
            <div class="section-title">Atención Urgente <span class="badge urgent">!</span></div>
            <div class="card" style="border-left: 4px solid var(--danger); background: var(--danger-light);">
                <div style="font-weight:700; color:var(--danger); margin-bottom:8px; font-size:14px;">No hay citas agendadas hoy.</div>
                <div style="font-size:15px; color:var(--text-main); font-weight:500;">
                    ${URGENT_ACTIVITIES[urgentTaskIndex]}
                </div>
            </div>`;
        } else {
            urgentHtml = `<div class="card" style="text-align:center; padding: 24px; color:var(--text-muted); font-size:14px;">¡Excelente! Tienes citas para hoy.</div>`;
        }

        return `
            <div class="verse-card">
                <div class="verse-text">"${verse.text}"</div>
                <div class="verse-ref">${verse.ref}</div>
            </div>

            <div style="display:flex; gap: 12px; margin: 20px 0;">
                <div class="card" style="flex:1; margin:0; text-align:center;">
                   <div style="font-size:26px; font-weight:700; color:var(--accent)">${people.length}</div>
                   <div style="font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Totales</div>
                </div>
                <div class="card" style="flex:1; margin:0; text-align:center;">
                   <div style="font-size:26px; font-weight:700; color:var(--success)">${todayAppointments}</div>
                   <div style="font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Citas Hoy</div>
                </div>
            </div>

            ${urgentHtml}
        `;
    },
    
    people() {
         const people = db.getPeople();
         let html = `<div class="section-title">Directorio</div>`;
         if(people.length === 0) return html + `<div class="card">No hay personas registradas.</div>`;
         
         const curriculumCache = db.getCurriculum();
         people.sort((a,b) => new Date(b.startDate) - new Date(a.startDate));
         
         html += people.map(p => `
             <div class="person-item" onclick="app.navigate('detail', '${p.id}')">
                 <div class="person-avatar">${p.name.charAt(0).toUpperCase()}</div>
                 <div class="person-info">
                     <div class="person-name">${p.name}</div>
                     <div class="person-meta">${p.status} • Lecciones: ${p.studies.length}/${curriculumCache.length}</div>
                 </div>
                 <ion-icon name="chevron-forward" style="color:var(--text-muted); font-size:18px;"></ion-icon>
             </div>
         `).join('');
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
             <!-- Status hidden, auto set to ACTIVE per requirements -->
             <button class="btn-primary" onclick="app.handlers.saveNewPerson()">Guardar Perfil</button>
          </div>
       `;
    },

    detail(id) {
        const p = db.getPerson(id);
        if(!p) return `<div>Error</div>`;
        const nextStudy = utils.getNextStudy(p);
        const curr = db.getCurriculum();

        return `
            <div class="card" style="display:flex; align-items:center; margin-bottom: 20px;">
                <div style="min-width:64px;width:64px;height:64px;background:var(--accent);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;">
                    ${p.name.charAt(0).toUpperCase()}
                </div>
                <div style="flex:1; margin-left:14px; overflow:hidden;">
                    <h2 style="font-size:20px; font-weight:600; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</h2>
                    <select class="form-select" style="padding:4px 8px; font-size:12px; width:auto; border:0; background:var(--accent-light); color:var(--accent);" onchange="app.handlers.changeStatus('${p.id}', this.value)">
                        <option disabled>Cambiar Estado</option>
                        <option value="ACTIVO" ${p.status==='ACTIVO'?'selected':''}>Activo</option>
                        <option value="EN PAUSA" ${p.status==='EN PAUSA'?'selected':''}>En Pausa</option>
                        <option value="CANCELADO" ${p.status==='CANCELADO'?'selected':''}>Cancelado (Abandonó)</option>
                        <option value="TERMINADO" ${p.status==='TERMINADO'?'selected':''}>Terminado</option>
                    </select>
                </div>
                <button class="whatsapp-btn" onclick="app.handlers.openWhatsApp('${p.phone}')"><ion-icon name="logo-whatsapp"></ion-icon></button>
            </div>

            <!-- Sugerencia iOS Style -->
            <div class="card" style="background:var(--accent-light); border:0; padding:16px;">
                <div style="font-weight:600; font-size:13px; color:var(--accent); margin-bottom:6px; text-transform:uppercase;">Próximo Paso Sugerido</div>
                ${nextStudy 
                    ? `<p style="font-size:15px; margin-bottom: 12px; font-weight:500;">Estudiar: <strong>${nextStudy.title}</strong></p>
                       <button onclick="app.handlers.openWhatsApp('${p.phone}', 'Hola ${p.name.split(' ')[0]}, ¿listo para nuestro próximo estudio: ${nextStudy.title}?')" style="background:var(--bg-secondary); border:0; color:var(--accent); padding:10px 16px; border-radius:10px; font-size:15px; font-weight:600; width:100%;">Enviar Mensaje para Agendar</button>`
                    : `<p style="font-size:15px; margin-bottom: 0; font-weight:500;">¡Ha completado todo el currículo base!</p>`
                }
            </div>
            
            <button class="btn-primary" style="margin-bottom:20px;" onclick="app.navigate('newsession', '${p.id}')"><ion-icon name="pencil"></ion-icon> Registrar un tiempo</button>

            <!-- Historial -->
            <div class="section-title">Historial</div>
            ${p.studies.length === 0 ? `<div class="card text-center" style="color:var(--text-muted);">Sin tiempos registrados.</div>` : 
              [...p.studies].reverse().map(s => {
                  const scurr = curr.find(c => c.id === s.studyId);
                  const titleStr = s.studyId === 0 ? "Tiempo de ánimo / Convivencia" : (scurr ? scurr.title : 'Estudio Especial');
                  return `
                      <div class="card" style="padding:16px;">
                          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                              <strong style="color:var(--text-main); font-size:15px;">${titleStr}</strong>
                              <span style="font-size:13px; color:var(--text-muted)">${utils.formatDate(s.date)}</span>
                          </div>
                          <div style="font-size:14px; color:var(--text-muted);">${s.notes || 'Sin anotaciones.'}</div>
                      </div>`
              }).join('')
            }

            <!-- Agenda -->
            <div class="section-title">Agendar Próxima</div>
            <div class="card" id="detail-agenda-card">
                ${p.nextAppointment ? `<div style="margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid var(--glass-border); font-size:14px;"><strong>Cita actual (${p.appointmentType}):</strong> ${utils.formatDate(p.nextAppointment)} - ${utils.formatTime(p.nextAppointment)}<br><span style="color:var(--text-muted); font-size:13px;"><ion-icon name="location-outline" style="vertical-align:middle;"></ion-icon> ${p.location||'Sin ubicación'}</span></div>` : ''}
                <div class="form-group">
                    <label class="form-label">Tipo de Cita</label>
                    <select id="a-type" class="form-select">
                        <option value="ESTUDIO" ${p.appointmentType==='ESTUDIO'?'selected':''}>Estudio Bíblico</option>
                        <option value="TIEMPO DE ÁNIMO" ${p.appointmentType==='TIEMPO DE ÁNIMO'?'selected':''}>Tiempo de Ánimo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha y Hora</label>
                    <input type="datetime-local" id="a-datetime" class="form-input" value="${p.nextAppointment ? p.nextAppointment.slice(0,16) : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Lugar o Link</label>
                    <input type="text" id="a-location" class="form-input" placeholder="Ej. Cafetería, Zoom..." value="${p.location}">
                </div>
                <button class="btn-primary" style="padding:12px; font-size:15px;" onclick="app.handlers.saveAppointment('${p.id}')">Guardar Cita</button>
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

        html += items.map(item => {
            const isPast = item.date < new Date();
            const accent = isPast ? 'var(--danger)' : 'var(--accent)';
            return `
            <div class="card" style="border-left: 4px solid ${accent}" onclick="app.navigate('detail', '${item.p.id}')">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <strong style="font-size:16px;">${item.p.name}</strong>
                    <span style="font-size:13px; font-weight:600; color:${accent}">${utils.formatDate(item.date)} ${utils.formatTime(item.date)}</span>
                </div>
                <div style="font-size:13px; color:var(--text-main); font-weight:500; margin-bottom:4px;">
                    ${item.p.appointmentType}
                </div>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">
                    <ion-icon name="location-outline" style="vertical-align:text-bottom;"></ion-icon> ${item.p.location || 'Por definir'}
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-primary" style="background:${accent}; padding:8px; font-size:13px;" onclick="event.stopPropagation(); app.handlers.openWhatsApp('${item.p.phone}', 'Hola, nos vemos en nuestra cita de ${item.p.appointmentType}: ${item.p.location||''}')"><ion-icon name="logo-whatsapp"></ion-icon> Avisar</button>
                    <!-- Editar abre la ficha y hace foco en la agenda -->
                    <button class="btn-primary" style="background:var(--bg-primary); color:var(--text-main); padding:8px; font-size:13px;" onclick="event.stopPropagation(); app.navigate('detail', '${item.p.id}'); setTimeout(()=>document.getElementById('detail-agenda-card').scrollIntoView(), 100);"><ion-icon name="pencil-outline"></ion-icon> Editar</button>
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
                <h2 style="font-size:20px; font-weight:600; margin-bottom:8px;">Ajustes de la App</h2>
                <div style="margin-top:16px; text-align:left; font-size:14px; line-height:1.5;">
                    PWA instalable - Versión Offline.<br><br>
                    <strong>Para instalar:</strong> Toca Compartir > Añadir a Inicio.
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
            `;
    }
}

document.addEventListener('DOMContentLoaded', () => app.init());
