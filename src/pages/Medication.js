export const MedicationTab = (user) => {
  const API = 'http://localhost:3001/api';
  const today = new Date();
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let view = 'day';
  let selectedDate = new Date(today);
  let medications = [];
  let logs = [];
  let loading = false;
  let showAddModal = false;

  // ── API Calls ─────────────────────────────────────────────
  async function fetchData() {
    if (!user?.id) return;
    loading = true;
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`${API}/medication?user_id=${user.id}&date=${dateStr}`);
      const data = await res.json();
      medications = data.medications || [];
      logs = data.logs || [];
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      loading = false;
    }
  }

  async function toggleLog(medication_id, dose_type, taken) {
    try {
      const log_date = selectedDate.toISOString().split('T')[0];
      await fetch(`${API}/medication/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, medication_id, log_date, dose_type, taken })
      });
      await fetchData();
    } catch (err) {
      console.error('Toggle log error:', err);
    }
  }

  async function addMedication(formData) {
    try {
      const res = await fetch(`${API}/medication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id })
      });
      if (!res.ok) throw new Error('Failed to add');
      showAddModal = false;
      await fetchData();
    } catch (err) {
      console.error('Add med error:', err);
      alert('Failed to add medication. Please try again.');
    }
  }

  // ── SVG helpers ──────────────────────────────────────────
  function pillIcon(s) { return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="${s}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`; }
  const circleIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
  const circleCheckIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

  // ── UI Components ─────────────────────────────────────────
  function dayView() {
    const strip = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i);
      strip.push({ d, isSelected: i === 0, isToday: sameDay(d, today) });
    }

    const dailySchedule = [];
    medications.forEach(m => {
      m.frequency.forEach(dose => {
        const isTaken = logs.some(l => l.medication_id === m.id && l.dose_type === dose);
        dailySchedule.push({ ...m, dose_type: dose, taken: isTaken });
      });
    });

    const totalDoses = dailySchedule.length;
    const takenDoses = dailySchedule.filter(d => d.taken).length;
    const pct = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    return `
    <div class="tab-content fade-in" style="padding-bottom:5rem; position:relative;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:1.8rem 1.5rem 0.8rem;">
        <div>
          <h2 style="font-size:1.15rem; font-weight:700; color:var(--text-main);">Daily Meds</h2>
          <p style="color:var(--text-muted); font-size:0.75rem;">
            ${DAY_NAMES[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}
          </p>
        </div>
        <div class="view-toggle-wrap">
          <button class="view-toggle-btn${view === 'day' ? ' active' : ''}" id="vt-day">Day</button>
          <button class="view-toggle-btn${view === 'month' ? ' active' : ''}" id="vt-month">Month</button>
        </div>
      </div>

      <div style="display:flex; gap:0.3rem; padding:0 1.2rem; margin-bottom:1rem; overflow-x:auto; scrollbar-width:none;">
        ${strip.map(({ d, isSelected, isToday }) => `
          <div class="day-chip${isSelected ? ' selected' : ''}" data-date="${d.toISOString()}"
               style="flex:1; min-width:38px; display:flex; flex-direction:column; align-items:center;
                      padding:0.5rem 0.2rem; border-radius:14px; cursor:pointer;
                      background:${isSelected ? 'var(--primary)' : isToday ? '#eff6ff' : '#f8fafc'};
                      border:${isToday && !isSelected ? '1.5px solid var(--primary)' : 'none'};">
            <span style="font-size:0.55rem; font-weight:600;
                         color:${isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'};">
              ${DAY_NAMES[d.getDay()].toUpperCase().slice(0, 3)}
            </span>
            <span style="font-size:0.85rem; font-weight:700; margin-top:2px;
                         color:${isSelected ? 'white' : 'var(--text-main)'};">${d.getDate()}</span>
          </div>
        `).join('')}
      </div>

      <div style="margin:0 1.5rem 1.1rem; background:${totalDoses > 0 && takenDoses === totalDoses ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'var(--primary)'}; border-radius:20px; padding:1.1rem 1.3rem; position:relative; overflow:hidden;">
        <div style="position:absolute; right:-16px; bottom:-22px; width:90px; height:90px; background:rgba(255,255,255,0.08); border-radius:50%;"></div>
        ${totalDoses > 0 && takenDoses === totalDoses
        ? `<p style="color:white; font-weight:700; font-size:0.95rem; margin-bottom:2px;">🎉 All done!</p>
             <p style="color:rgba(255,255,255,0.85); font-size:0.72rem; margin-bottom:0.8rem;">You took all your medications today</p>`
        : `<p style="color:white; font-weight:700; font-size:0.85rem; margin-bottom:2px;">Daily Progress</p>
             <p style="color:rgba(255,255,255,0.7); font-size:0.72rem; margin-bottom:0.8rem;">${takenDoses} of ${totalDoses} doses taken</p>`
      }
        <div style="background:rgba(255,255,255,0.3); border-radius:50px; height:7px; overflow:hidden;">
          <div style="background:white; height:100%; width:${pct}%; border-radius:50px; transition:width 0.4s;"></div>
        </div>
      </div>

      <div style="padding:0 1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.9rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-main);">Today's Schedule</h3>
          <button id="add-med-btn" style="color:var(--primary); background:none; border:none; font-size:0.8rem; font-weight:700; cursor:pointer;">+ Add New</button>
        </div>

        ${loading ? '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Loading...</p>' : ''}
        
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${dailySchedule.length === 0 && !loading ? '<p style="text-align:center; color:var(--text-muted); padding:2rem; font-size:0.85rem;">No medications scheduled for today.</p>' : ''}
          ${dailySchedule.map(m => `
            <div style="background:white; border-radius:18px; padding:1rem; display:flex; align-items:center; justify-content:space-between; border:1px solid #f1f5f9; box-shadow:0 2px 12px rgba(0,0,0,0.03);">
              <div style="display:flex; align-items:center; gap:0.85rem;">
                <div style="width:44px; height:44px; background:#eff6ff; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  ${pillIcon('var(--primary)')}
                </div>
                <div>
                  <p style="font-weight:700; font-size:0.82rem; color:var(--text-main);">${m.name}</p>
                  <p style="font-size:0.72rem; color:var(--text-muted);">${m.dosage || ''} · ${m.dose_type.charAt(0).toUpperCase() + m.dose_type.slice(1)}</p>
                </div>
              </div>
              <button class="med-check-btn" data-id="${m.id}" data-type="${m.dose_type}" data-taken="${m.taken}"
                      style="background:none; border:none; cursor:pointer; padding:5px;">
                ${m.taken ? circleCheckIcon : circleIcon}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      ${showAddModal ? addModalUI() : ''}
    </div>`;
  }

  function addModalUI() {
    return `
    <div id="add-modal-overlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; align-items:center; justify-content:center; padding:1.5rem; backdrop-filter:blur(3px);">
      <div style="background:white; width:100%; max-width:340px; border-radius:24px; padding:1.8rem; box-shadow:0 20px 50px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">
        <h3 style="font-size:1.2rem; font-weight:800; color:var(--text-main); margin-bottom:1.2rem;">Add New Medication</h3>
        
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <div class="input-group">
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:5px; display:block;">Medication Name</label>
            <input type="text" id="new-med-name" placeholder="e.g. Aspirin" style="width:100%; padding:0.8rem; border:1px solid #e2e8f0; border-radius:12px; font-size:0.9rem;">
          </div>
          <div class="input-group">
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:5px; display:block;">Dosage</label>
            <input type="text" id="new-med-dosage" placeholder="e.g. 500mg" style="width:100%; padding:0.8rem; border:1px solid #e2e8f0; border-radius:12px; font-size:0.9rem;">
          </div>
          
          <div class="input-group">
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px; display:block;">Frequency</label>
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:0.8rem; border-radius:12px;">
              <label style="display:flex; align-items:center; gap:5px; font-size:0.82rem; cursor:pointer;"><input type="checkbox" name="freq" value="morning"> Morning</label>
              <label style="display:flex; align-items:center; gap:5px; font-size:0.82rem; cursor:pointer;"><input type="checkbox" name="freq" value="afternoon"> Afternoon</label>
              <label style="display:flex; align-items:center; gap:5px; font-size:0.82rem; cursor:pointer;"><input type="checkbox" name="freq" value="evening"> Evening</label>
            </div>
          </div>

          <div style="display:flex; gap:0.8rem;">
            <div class="input-group" style="flex:1;">
               <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:5px; display:block;">Start Date</label>
               <input type="date" id="new-med-start" value="${today.toISOString().split('T')[0]}" style="width:100%; padding:0.8rem; border:1px solid #e2e8f0; border-radius:12px; font-size:0.85rem;">
            </div>
            <div class="input-group" style="flex:1;">
               <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:5px; display:block;">Days</label>
               <input type="number" id="new-med-days" placeholder="30" value="30" style="width:100%; padding:0.8rem; border:1px solid #e2e8f0; border-radius:12px; font-size:0.85rem;">
            </div>
          </div>

          <div style="display:flex; gap:0.8rem; margin-top:0.5rem;">
            <button id="close-modal-btn" style="flex:1; padding:0.9rem; border-radius:50px; border:none; background:#f1f5f9; color:var(--text-main); font-weight:700; cursor:pointer;">Cancel</button>
            <button id="save-med-btn" style="flex:1; padding:0.9rem; border-radius:50px; border:none; background:var(--primary); color:white; font-weight:700; cursor:pointer;">Save</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function monthView() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let cells = '';
    for (let i = 0; i < firstDay; i++) cells += `<div></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = sameDay(new Date(year, month, d), today);
      const isSelected = d === selectedDate.getDate();
      cells += `
        <div class="cal-day" data-day="${d}"
             style="height:46px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; border-radius:10px; position:relative;
                    background:${isSelected ? 'var(--primary)' : isToday ? '#eff6ff' : 'none'}; border:${isToday && !isSelected ? '1px solid var(--primary)' : 'none'};">
          <span style="font-size:0.9rem; font-weight:${isSelected || isToday ? '800' : '600'}; color:${isSelected ? 'white' : isToday ? 'var(--primary)' : 'var(--text-main)'};">${d}</span>
        </div>`;
    }

    return `
    <div class="tab-content fade-in" style="height:100%; display:flex; flex-direction:column;">
      <div style="padding:1.8rem 1.5rem 0.5rem; display:flex; justify-content:space-between; align-items:center;">
        <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-main);">${MONTHS[month]} ${year}</h2>
        <div class="view-toggle-wrap">
          <button class="view-toggle-btn${view === 'day' ? ' active' : ''}" id="vt-day">Day</button>
          <button class="view-toggle-btn${view === 'month' ? ' active' : ''}" id="vt-month">Month</button>
        </div>
      </div>

      <div style="padding:1rem 1.5rem;">
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:2px; text-align:center;">
          ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); padding-bottom:8px;">${d}</div>`).join('')}
          ${cells}
        </div>
      </div>
      
      <div style="flex:1; background:#f8fafc; border-radius:30px 30px 0 0; margin-top:1rem; padding:1.5rem;">
         <h3 style="font-size:0.95rem; font-weight:800; color:var(--text-main); margin-bottom:1rem;">Monthly Summary</h3>
         <div style="background:white; border-radius:20px; padding:1.2rem; display:flex; gap:1rem; align-items:center; border:1px solid #f1f5f9;">
           <div style="flex:1; text-align:center; border-right:1px solid #f1f5f9;">
             <p style="font-size:1.5rem; font-weight:800; color:var(--primary);">--</p>
             <p style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">Overall Adherence</p>
           </div>
           <div style="flex:1; text-align:center;">
             <p style="font-size:1.5rem; font-weight:800; color:#22c55e;">--</p>
             <p style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">Day Streak</p>
           </div>
         </div>
      </div>
    </div>`;
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  const render = async (container) => {
    if (!medications.length && !loading && user?.id) {
      await fetchData();
    }

    container.innerHTML = view === 'day' ? dayView() : monthView();

    container.querySelector('#vt-day')?.addEventListener('click', () => { view = 'day'; render(container); });
    container.querySelector('#vt-month')?.addEventListener('click', () => { view = 'month'; render(container); });

    container.querySelectorAll('.day-chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        selectedDate = new Date(chip.dataset.date);
        await fetchData();
        render(container);
      });
    });

    container.querySelectorAll('.cal-day').forEach(cell => {
      cell.addEventListener('click', async () => {
        const d = cell.dataset.day;
        selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), parseInt(d));
        view = 'day';
        await fetchData();
        render(container);
      });
    });

    container.querySelectorAll('.med-check-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        const taken = btn.dataset.taken === 'true';
        btn.innerHTML = '...';
        await toggleLog(id, type, !taken);
        render(container);
      });
    });

    container.querySelector('#add-med-btn')?.addEventListener('click', () => {
      showAddModal = true;
      render(container);
    });

    const overlay = container.querySelector('#add-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        showAddModal = false;
        render(container);
      });
      container.querySelector('#close-modal-btn')?.addEventListener('click', () => {
        showAddModal = false;
        render(container);
      });
      container.querySelector('#save-med-btn')?.addEventListener('click', async () => {
        const name = container.querySelector('#new-med-name').value.trim();
        const dosage = container.querySelector('#new-med-dosage').value.trim();
        const start_date = container.querySelector('#new-med-start').value;
        const duration_days = parseInt(container.querySelector('#new-med-days').value);
        const freqInputs = container.querySelectorAll('input[name="freq"]:checked');
        const frequency = Array.from(freqInputs).map(i => i.value);

        if (!name || frequency.length === 0) {
          alert('Please enter a name and select at least one frequency dose.');
          return;
        }

        container.querySelector('#save-med-btn').textContent = '...';
        await addMedication({ name, dosage, frequency, start_date, duration_days });
        render(container);
      });
    }
  };

  return { render };
};
