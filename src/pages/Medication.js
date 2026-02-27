export const MedicationTab = (onAddNew) => {
    const today = new Date();
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Build week strip (today centered)
    const weekDays = [];
    for (let i = -2; i <= 3; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        weekDays.push({ date: d.getDate(), day: dayNames[d.getDay()], isToday: i === 0 });
    }

    // Dummy medication data
    const meds = [
        { id: 1, name: 'Aspirin', time: '8:00 AM', dose: '1 pill', taken: true, color: '#dcfce7', stroke: '#22c55e', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>` },
        { id: 2, name: 'Vitamin D', time: '2:00 PM', dose: '1 tablet', taken: false, color: '#eff6ff', stroke: '#3b82f6', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>` },
    ];

    const taken = meds.filter(m => m.taken).length;
    const total = meds.length;
    const progress = Math.round((taken / total) * 100);

    const toggleStates = {};
    meds.forEach(m => { toggleStates[m.id] = m.taken; });

    const render = (container) => {
        container.innerHTML = `
      <div class="tab-content fade-in" style="padding-bottom: 1.5rem; position: relative;">

        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; padding: 2rem 1.5rem 1rem;">
          <div>
            <h2 style="font-size:1.5rem; font-weight:800; color:var(--text-main);">Daily Meds</h2>
            <p style="color:var(--text-muted); font-size:0.82rem;">${dayNames[today.getDay()].charAt(0) + dayNames[today.getDay()].slice(1).toLowerCase()}, ${monthNames[today.getMonth()]} ${today.getDate()}</p>
          </div>
          <div style="width:40px; height:40px; background:#eff6ff; border-radius:12px; display:flex; align-items:center; justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>
        </div>

        <!-- Week strip -->
        <div style="display:flex; gap:0.4rem; padding: 0 1.5rem; margin-bottom:1.2rem; overflow-x:auto; scrollbar-width:none;">
          ${weekDays.map(w => `
            <div style="flex:1; min-width:42px; display:flex; flex-direction:column; align-items:center; padding:0.6rem 0.3rem; border-radius:14px; background:${w.isToday ? 'var(--primary)' : '#f8fafc'}; cursor:pointer;">
              <span style="font-size:0.6rem; font-weight:600; color:${w.isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'};">${w.day}</span>
              <span style="font-size:1rem; font-weight:700; margin-top:2px; color:${w.isToday ? 'white' : 'var(--text-main)'};">${w.date}</span>
            </div>
          `).join('')}
        </div>

        <!-- Daily Progress card -->
        <div style="margin:0 1.5rem 1.5rem; background:var(--primary); border-radius:22px; padding:1.2rem 1.4rem; position:relative; overflow:hidden;">
          <div style="position:absolute; right:-20px; bottom:-20px; width:100px; height:100px; background:rgba(255,255,255,0.08); border-radius:50%;"></div>
          <div style="position:absolute; right:20px; bottom:-40px; width:80px; height:80px; background:rgba(255,255,255,0.06); border-radius:50%;"></div>
          <p style="color:white; font-weight:700; font-size:1rem; margin-bottom:2px;">Daily Progress</p>
          <p style="color:rgba(255,255,255,0.75); font-size:0.8rem; margin-bottom:1rem;">${taken} of ${total} medications taken</p>
          <div style="background:rgba(255,255,255,0.3); border-radius:50px; height:8px; overflow:hidden;">
            <div style="background:white; height:100%; width:${progress}%; border-radius:50px; transition:width 0.5s ease;"></div>
          </div>
        </div>

        <!-- Today's schedule -->
        <div style="padding: 0 1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="font-weight:700; font-size:1rem; color:var(--text-main);">Today's Schedule</h3>
            <span id="add-med-btn" style="color:var(--primary); font-size:0.82rem; font-weight:600; cursor:pointer;">+ Add New</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.75rem;" id="med-list">
            ${meds.map(m => `
              <div class="med-card ${m.taken ? 'taken' : ''}" data-id="${m.id}" style="background:white; border-radius:18px; padding:1rem 1.2rem; display:flex; align-items:center; justify-content:space-between; border:1px solid #f1f5f9; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                <div style="display:flex; align-items:center; gap:0.9rem;">
                  <div style="width:44px; height:44px; background:${m.taken ? '#f0fdf4' : m.color}; border-radius:14px; display:flex; align-items:center; justify-content:center; ${m.taken ? 'opacity:0.7;' : ''}">
                    ${m.icon}
                  </div>
                  <div>
                    <p style="font-weight:700; color:${m.taken ? 'var(--text-muted)' : 'var(--text-main)'}; font-size:0.95rem; ${m.taken ? 'text-decoration:line-through;' : ''}">${m.name}</p>
                    <p style="font-size:0.78rem; color:var(--text-muted);">${m.time} · ${m.dose}</p>
                  </div>
                </div>
                ${m.taken
                ? `<div style="width:28px; height:28px; background:#dcfce7; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                     </div>`
                : `<label class="med-toggle" title="Mark as taken">
                       <input type="checkbox" class="med-toggle-input" data-id="${m.id}">
                       <span class="med-toggle-slider"></span>
                     </label>`
            }
              </div>
            `).join('')}
          </div>

          <!-- End of schedule -->
          <div style="display:flex; align-items:center; gap:0.7rem; padding:1.2rem 0.5rem; color:var(--text-muted);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div>
              <p style="font-size:0.85rem; font-weight:600; font-style:italic;">No more today</p>
              <p style="font-size:0.75rem;">Stay hydrated!</p>
            </div>
          </div>
        </div>

        <!-- FAB -->
        <div id="fab-add-med" style="position:sticky; bottom:1.2rem; right:1.5rem; width:52px; height:52px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(0,82,204,0.4); cursor:pointer; margin-left:auto; margin-right:1.5rem;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
        </div>

      </div>
    `;

        // Toggle listeners
        container.querySelectorAll('.med-toggle-input').forEach(cb => {
            cb.addEventListener('change', () => {
                toggleStates[cb.dataset.id] = cb.checked;
                // re-render with updated taken state
                meds.forEach(m => { if (String(m.id) === cb.dataset.id) m.taken = cb.checked; });
                render(container);
            });
        });
    };

    return { render };
};
