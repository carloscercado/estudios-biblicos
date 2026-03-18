// --- Data Layer (IndexedDB / LocalStorage Wrapper) ---
const db = {
    get(key, defaultValue = []) {
        try { return JSON.parse(localStorage.getItem(key)) || defaultValue; }
        catch { return defaultValue; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    getPeople() { return this.get('people'); },
    getPerson(id) { return this.getPeople().find(p => p.id === id); },
    savePerson(person) {
        const people = this.getPeople();
        if (person.id) {
            const index = people.findIndex(p => p.id === person.id);
            if(index !== -1) people[index] = person;
            else people.push(person);
        } else {
            person.id = Date.now().toString();
            person.startDate = person.startDate || new Date().toISOString();
            person.status = person.status || 'ACTIVO';
            person.studies = person.studies || [];
            person.nextAppointment = person.nextAppointment || null;
            person.location = person.location || '';
            people.push(person);
        }
        this.set('people', people);
    },
    addStudyRecord(personId, studyId, notes) {
        const p = this.getPerson(personId);
        if(p) {
            p.studies.push({ studyId, date: new Date().toISOString(), notes });
            this.savePerson(p);
        }
    },
    setNextAppointment(personId, datetime, location = '') {
        const p = this.getPerson(personId);
        if(p) { p.nextAppointment = datetime; p.location = location; this.savePerson(p); }
    },
    initDummyData() {
        if(this.getPeople().length === 0) {
            // Person 1: Activo, up to date
            this.savePerson({ id: "101", name: "Ana López", phone: "5551234567", startDate: new Date(Date.now() - 30 * 86400000).toISOString(), status: 'ACTIVO', studies: [ { studyId: 1, date: new Date(Date.now() - 2 * 86400000).toISOString(), notes: "Buena recepción del primer tema." } ], nextAppointment: new Date(Date.now() + 2 * 86400000).toISOString(), location: "Cafetería Central" });
            // Person 2: Urgente (Inactivo)
            this.savePerson({ id: "102", name: "Carlos Ruiz", phone: "5559876543", startDate: new Date(Date.now() - 15 * 86400000).toISOString(), status: 'ACTIVO', studies: [ { studyId: 1, date: new Date(Date.now() - 10 * 86400000).toISOString(), notes: "Con ciertas dudas sobre la cruz." } ], nextAppointment: null, location: "" });
            // Person 3: Completado / Pausado
            this.savePerson({ id: "103", name: "María Gómez", phone: "5555555555", startDate: new Date(Date.now() - 60 * 86400000).toISOString(), status: 'EN PAUSA', studies: [ { studyId: 1, date: new Date(Date.now() - 50 * 86400000).toISOString(), notes: "" }, { studyId: 2, date: new Date(Date.now() - 40 * 86400000).toISOString(), notes: "" } ], nextAppointment: null, location: "" });
        }
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
        const completedIds = person.studies.map(s => s.studyId);
        return CURRICULUM.find(c => !completedIds.includes(c.id)) || null;
    }
};

// --- Main App Logic ---
const app = {
    currentView: 'dashboard',
    
    init() {
        db.initDummyData();
        this.navigate('dashboard');
        
        // Solicitar permiso de notificaciones Push (PWA interactiva)
        if ('Notification' in window && navigator.serviceWorker) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
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
        
        document.getElementById('header-title').innerText = this.getTitle(view);
        const container = document.getElementById('view-container');
        container.innerHTML = views[view] ? views[view](data) : '<h1>404 no encontrado</h1>';
        window.scrollTo(0,0);
        
        // Inicializar Google Maps Places Autocomplete si el input de locación existe en la vista DOM
        const locationInput = document.getElementById('a-location');
        if (locationInput && window.google && google.maps && google.maps.places) {
            new google.maps.places.Autocomplete(locationInput, { fields: ["formatted_address", "name"], types: ["geocode", "establishment"] });
        }
    },
    
    getTitle(view) {
        const titles = { dashboard: 'Inicio', people: 'Personas', 'add-person': 'Nueva Persona', agenda: 'Agenda', settings: 'Información', detail: 'Ficha de Persona', newsession: 'Registrar Estudio' };
        return titles[view] || 'App';
    },

    showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: var(--text-main); color: var(--bg-primary); padding: 14px 24px; border-radius: 20px;
            margin-bottom: 12px; font-size: 14px; font-weight: 500; text-align: center;
            animation: slideUp 0.3s, fadeOut 0.3s 2.7s forwards; box-shadow: var(--shadow-md);
        `;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    handlers: {
        saveNewPerson() {
            const name = document.getElementById('p-name').value.trim();
            const phone = document.getElementById('p-phone').value.trim();
            const status = document.getElementById('p-status').value;
            if(!name || !phone) return app.showToast('Completa los campos.');
            db.savePerson({ name, phone, status: status || 'ACTIVO' });
            app.showToast('Persona registrada');
            app.navigate('people');
        },
        saveSession(personId) {
            const studyId = document.getElementById('s-study').value;
            const notes = document.getElementById('s-notes').value.trim();
            if(!studyId) return app.showToast('Selecciona un estudio.');
            db.addStudyRecord(personId, parseInt(studyId), notes);
            app.showToast('Estudio registrado con éxito');
            app.navigate('detail', personId);
        },
        saveAppointment(personId) {
            const datetime = document.getElementById('a-datetime').value;
            const location = document.getElementById('a-location').value.trim();
            if(!datetime) return app.showToast('Elige fecha y hora');
            db.setNextAppointment(personId, new Date(datetime).toISOString(), location);
            
            // Simulación local de notificación al guardar una cita
            if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification('Cita programada', {
                        body: `Cita con ${db.getPerson(personId).name} a las ${utils.formatTime(new Date(datetime))} en ${location || 'ubicación pte.'}. (Recibirás tu recordatorio)`,
                        icon: '/icon-192x192.png'
                    });
                });
            }

            app.showToast('Cita guardada correctamente');
            app.navigate('detail', personId);
        },
        openWhatsApp(phone, message = '') {
            const clean = utils.cleanPhone(phone);
            const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    }
};

// --- View Renderers ---
const views = {
    dashboard() {
        const verse = DAILY_VERSES[new Date().getDay() % DAILY_VERSES.length];
        const people = db.getPeople();
        let urgentHtml = ''; let urgentCount = 0; let todayAppointments = 0;

        people.forEach(p => {
            const daysInact = p.studies.length ? utils.daysSince(p.studies[p.studies.length-1].date) : utils.daysSince(p.startDate);
            if (p.status === 'ACTIVO' && daysInact >= 7) {
                urgentCount++;
                const isMsg = "¡Hola! ¿Cómo has estado? Me acordé de ti y te envío un saludo.";
                urgentHtml += `
                    <div class="person-item" onclick="app.navigate('detail', '${p.id}')">
                         <div class="person-avatar" style="background:var(--danger-light); color:var(--danger)"><ion-icon name="warning"></ion-icon></div>
                         <div class="person-info">
                             <div class="person-name">${p.name}</div>
                             <div class="person-meta" style="color:var(--danger)">Inactivo por ${daysInact} días</div>
                         </div>
                         <button class="whatsapp-btn" onclick="event.stopPropagation(); app.handlers.openWhatsApp('${p.phone}', '${isMsg}')"><ion-icon name="logo-whatsapp"></ion-icon></button>
                    </div>`;
            }
            if(p.nextAppointment && new Date(p.nextAppointment).toDateString() === new Date().toDateString()) todayAppointments++;
        });

        if(!urgentHtml) urgentHtml = `<div class="card" style="text-align:center; padding: 24px; color:var(--text-muted); font-size:14px;">¡Excelente! Todo tu discipulado está al día.</div>`;

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

            <div class="section-title">Atención Urgente <span class="badge urgent">${urgentCount}</span></div>
            ${urgentHtml}
        `;
    },
    
    people() {
         const people = db.getPeople();
         let html = `<div class="section-title">Directorio</div>`;
         if(people.length === 0) return html + `<div class="card">No hay personas.</div>`;
         
         people.sort((a,b) => new Date(b.startDate) - new Date(a.startDate));
         html += people.map(p => `
             <div class="person-item" onclick="app.navigate('detail', '${p.id}')">
                 <div class="person-avatar">${p.name.charAt(0).toUpperCase()}</div>
                 <div class="person-info">
                     <div class="person-name">${p.name}</div>
                     <div class="person-meta">${p.status} • Lecciones: ${p.studies.length}/${CURRICULUM.length}</div>
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
             <div class="form-group">
                <label class="form-label">Estado Inicial</label>
                <select id="p-status" class="form-select">
                    <option value="ACTIVO">Activo</option>
                    <option value="EN PAUSA">En Pausa</option>
                    <option value="TERMINADO">Terminado</option>
                </select>
             </div>
             <button class="btn-primary" onclick="app.handlers.saveNewPerson()">Guardar Perfil</button>
          </div>
       `;
    },

    detail(id) {
        const p = db.getPerson(id);
        if(!p) return `<div>Error</div>`;
        const nextStudy = utils.getNextStudy(p);

        return `
            <div class="card" style="display:flex; align-items:center; margin-bottom: 20px;">
                <div style="width:64px;height:64px;background:var(--accent);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;">
                    ${p.name.charAt(0).toUpperCase()}
                </div>
                <div style="flex:1; margin-left:14px;">
                    <h2 style="font-size:20px; font-weight:600; margin-bottom:2px;">${p.name}</h2>
                    <div style="font-size:14px; color:var(--text-muted);">${p.status}</div>
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
            
            <button class="btn-primary" style="margin-bottom:20px;" onclick="app.navigate('newsession', '${p.id}')">Registrar Lección</button>

            <!-- Historial -->
            <div class="section-title">Historial</div>
            ${p.studies.length === 0 ? `<div class="card text-center" style="color:var(--text-muted);">Sin lecciones registradas.</div>` : 
              [...p.studies].reverse().map(s => {
                  const curr = CURRICULUM.find(c => c.id === s.studyId);
                  return `
                      <div class="card" style="padding:16px;">
                          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                              <strong style="color:var(--text-main); font-size:15px;">${curr ? curr.title : 'N/A'}</strong>
                              <span style="font-size:13px; color:var(--text-muted)">${utils.formatDate(s.date)}</span>
                          </div>
                          <div style="font-size:14px; color:var(--text-muted);">${s.notes || 'Buen progreso.'}</div>
                      </div>`
              }).join('')
            }

            <!-- Agenda -->
            <div class="section-title">Agendar Próxima</div>
            <div class="card">
                ${p.nextAppointment ? `<div style="margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid var(--glass-border); font-size:14px;"><strong>Cita actual:</strong> ${utils.formatDate(p.nextAppointment)} - ${utils.formatTime(p.nextAppointment)}<br><span style="color:var(--text-muted); font-size:13px;"><ion-icon name="location-outline" style="vertical-align:middle;"></ion-icon> ${p.location||'Sin ubicación'}</span></div>` : ''}
                <div class="form-group">
                    <label class="form-label">Fecha y Hora</label>
                    <input type="datetime-local" id="a-datetime" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Lugar o Link</label>
                    <input type="text" id="a-location" class="form-input" placeholder="Ej. Cafetería, Zoom..." value="">
                </div>
                <button class="btn-primary" style="padding:12px; font-size:15px;" onclick="app.handlers.saveAppointment('${p.id}')">Guardar Cita</button>
            </div>
        `;
    },

    newsession(personId) {
        const p = db.getPerson(personId);
        const completedIds = p.studies.map(s => s.studyId);
        let options = CURRICULUM.map(c => `<option value="${c.id}" ${completedIds.includes(c.id)?'disabled':''}>${completedIds.includes(c.id)?'✅':''} ${c.title}</option>`).join('');
        return `
            <div class="card">
                <h3 style="margin-bottom: 20px; font-weight:600;">Estudio con ${p.name.split(' ')[0]}</h3>
                <div class="form-group">
                    <label class="form-label">Lección Tomada</label>
                    <select id="s-study" class="form-select"><option value="">-- Elige lección --</option>${options}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">Notas y Desarrollo</label>
                    <textarea id="s-notes" class="form-textarea" rows="4" placeholder="Observaciones o dudas..."></textarea>
                </div>
                <div style="display:flex; gap:12px;">
                    <button class="btn-primary" style="background:var(--glass-border); color:var(--text-main);" onclick="app.navigate('detail', '${p.id}')">Volver</button>
                    <button class="btn-primary" onclick="app.handlers.saveSession('${p.id}')">Guardar</button>
                </div>
            </div>`;
    },

    agenda() {
        const people = db.getPeople(); let items = [];
        people.forEach(p => { if(p.nextAppointment) items.push({p, date: new Date(p.nextAppointment)}); });
        items.sort((a,b) => a.date - b.date);

        let html = `<div class="section-title">Calendario</div>`;
        if(items.length===0) return html + `<div class="card text-center">Sin eventos.</div>`;

        html += items.map(item => {
            const isPast = item.date < new Date();
            const accent = isPast ? 'var(--danger)' : 'var(--accent)';
            return `
            <div class="card" style="border-left: 4px solid ${accent}" onclick="app.navigate('detail', '${item.p.id}')">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <strong style="font-size:16px;">${item.p.name}</strong>
                    <span style="font-size:13px; font-weight:600; color:${accent}">${utils.formatDate(item.date)} ${utils.formatTime(item.date)}</span>
                </div>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:8px;">
                    <ion-icon name="location-outline" style="vertical-align:text-bottom;"></ion-icon> ${item.p.location || 'Por definir'}
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-primary" style="background:${accent}; padding:8px; font-size:13px;" onclick="event.stopPropagation(); app.handlers.openWhatsApp('${item.p.phone}', 'Hola, nos vemos en nuestra cita programada: ${item.p.location||''}')"><ion-icon name="logo-whatsapp"></ion-icon> Recordar</button>
                </div>
            </div>`
        }).join('');
        return html;
    },

    settings() {
        return `
            <div class="card text-center" style="padding:40px 20px;">
                <ion-icon name="book" style="font-size:48px; color:var(--accent); margin-bottom:16px;"></ion-icon>
                <h2 style="font-size:20px; font-weight:600; margin-bottom:8px;">Gestión de Personas</h2>
                <p style="font-size:14px; color:var(--text-muted);">Versión iOS Premium (Vanilla)</p>
                <div style="margin-top:24px; text-align:left; font-size:14px; line-height:1.5;">
                    Todo tu progreso está guardado localmente en este dispositivo.<br><br>
                    <strong>Para instalar:</strong> Toca el botón <em>Compartir</em> en Safari y elige <em>Añadir a la pantalla de inicio</em>.
                </div>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => app.init());
