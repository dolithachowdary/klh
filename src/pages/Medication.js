export const MedicationTab = () => {
  const today = new Date();
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let view = 'day';
  let selectedDate = new Date(today); // which date the day-view shows

  // ── Medications ───────────────────────────────────────────
  const meds = [
    { id: 1, name: 'Aspirin', time: '8:00 AM', dose: '1 pill', taken: true, color: '#ef4444', bg: '#fee2e2', icon: pillIcon('#ef4444') },
    { id: 2, name: 'Vitamin D', time: '2:00 PM', dose: '1 tablet', taken: false, color: '#3b82f6', bg: '#eff6ff', icon: capsuleIcon('#3b82f6') },
    { id: 3, name: 'Metformin', time: '9:00 PM', dose: '500mg', taken: false, color: '#8b5cf6', bg: '#f5f3ff', icon: pillIcon('#8b5cf6') },
  ];

  // ── SVG helpers ──────────────────────────────────────────
  function pillIcon(s) { return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="${s}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`; }
  function capsuleIcon(s) { return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="${s}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`; }

  // Circle (unchecked)
  const circleIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
  // Circle-check (checked) — filled blue
  const circleCheckIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

  // ── Adherence data generator ─────────────────────────────
  function monthData(month, year) {
    const days = new Date(year, month + 1, 0).getDate();
    const out = {};
    for (let d = 1; d <= days; d++) {
      out[d] = meds.map((m, i) => ({ color: m.color, taken: (d + i) % 3 !== 0 }));
    }
    return out;
  }

  // ── Day View ─────────────────────────────────────────────
  function dayView() {
    // Build 7-day strip centred on selectedDate
    const strip = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i);
      strip.push({ d, isSelected: i === 0, isToday: sameDay(d, today) });
    }

    const taken = meds.filter(m => m.taken).length;
    const pct = Math.round((taken / meds.length) * 100);

    return `
    <div class="tab-content fade-in" style="padding-bottom:5rem; position:relative;">

      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:1.8rem 1.5rem 0.8rem;">
        <div>
          <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-main);">Daily Meds</h2>
          <p style="color:var(--text-muted); font-size:0.78rem;">
            ${DAY_NAMES[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}
          </p>
        </div>
        <div class="view-toggle-wrap">
          <button class="view-toggle-btn${view === 'day' ? ' active' : ''}" id="vt-day">Day</button>
          <button class="view-toggle-btn${view === 'month' ? ' active' : ''}" id="vt-month">Month</button>
        </div>
      </div>

      <!-- Week strip (clickable) -->
      <div style="display:flex; gap:0.3rem; padding:0 1.2rem; margin-bottom:1rem; overflow-x:auto; scrollbar-width:none;">
        ${strip.map(({ d, isSelected, isToday }) => `
          <div class="day-chip${isSelected ? ' selected' : ''}" data-date="${d.toISOString()}"
               style="flex:1; min-width:38px; display:flex; flex-direction:column; align-items:center;
                      padding:0.5rem 0.2rem; border-radius:14px; cursor:pointer;
                      background:${isSelected ? 'var(--primary)' : isToday ? '#eff6ff' : '#f8fafc'};
                      border:${isToday && !isSelected ? '1.5px solid var(--primary)' : 'none'};">
            <span style="font-size:0.57rem; font-weight:600;
                         color:${isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'};">
              ${DAY_NAMES[d.getDay()].toUpperCase().slice(0, 3)}
            </span>
            <span style="font-size:0.95rem; font-weight:700; margin-top:2px;
                         color:${isSelected ? 'white' : 'var(--text-main)'};">${d.getDate()}</span>
          </div>
        `).join('')}
      </div>

      <!-- Progress card -->
      <div style="margin:0 1.5rem 1.1rem; background:${taken === meds.length ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'var(--primary)'}; border-radius:20px; padding:1.1rem 1.3rem; position:relative; overflow:hidden;">
        <div style="position:absolute; right:-16px; bottom:-22px; width:90px; height:90px; background:rgba(255,255,255,0.08); border-radius:50%;"></div>
        ${taken === meds.length
        ? `<p style="color:white; font-weight:700; font-size:1.05rem; margin-bottom:2px;">🎉 All done!</p>
             <p style="color:rgba(255,255,255,0.85); font-size:0.77rem; margin-bottom:0.8rem;">You took all your medications today</p>`
        : `<p style="color:white; font-weight:700; font-size:0.95rem; margin-bottom:2px;">Daily Progress</p>
             <p style="color:rgba(255,255,255,0.7); font-size:0.77rem; margin-bottom:0.8rem;">${taken} of ${meds.length} medications taken</p>`
      }
        <div style="background:rgba(255,255,255,0.3); border-radius:50px; height:7px; overflow:hidden;">
          <div style="background:white; height:100%; width:${pct}%; border-radius:50px; transition:width 0.4s;"></div>
        </div>
      </div>

      <!-- Schedule -->
      <div style="padding:0 1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.9rem;">
          <h3 style="font-weight:700; font-size:0.97rem; color:var(--text-main);">Today's Schedule</h3>
          <span style="color:var(--primary); font-size:0.78rem; font-weight:600; cursor:pointer;">+ Add New</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.6rem;">
          ${meds.map(m => `
            <div style="background:white; border-radius:16px; padding:0.9rem 1rem;
                        display:flex; align-items:center; justify-content:space-between;
                        border:1px solid #f1f5f9; box-shadow:0 2px 10px rgba(0,0,0,0.04);
                        ${m.taken ? 'opacity:0.72;' : ''}">
              <div style="display:flex; align-items:center; gap:0.8rem;">
                <div style="width:42px; height:42px; background:${m.taken ? '#f0fdf4' : m.bg};
                            border-radius:13px; display:flex; align-items:center; justify-content:center;">
                  ${m.icon}
                </div>
                <div>
                  <p style="font-weight:700; font-size:0.9rem;
                            color:${m.taken ? 'var(--text-muted)' : 'var(--text-main)'};
                            ${m.taken ? 'text-decoration:line-through;' : ''}">${m.name}</p>
                  <p style="font-size:0.74rem; color:var(--text-muted);">${m.time} · ${m.dose}</p>
                </div>
              </div>
              <button class="med-check-btn" data-id="${m.id}"
                      style="background:none; border:none; cursor:pointer; padding:0; display:flex; align-items:center;">
                ${m.taken ? circleCheckIcon : circleIcon}
              </button>
            </div>
          `).join('')}
        </div>

        ${taken === meds.length
        ? `<div style="display:flex; flex-direction:column; align-items:center; padding:1.2rem 0; gap:0.3rem;">
               <span style="font-size:2.5rem;">🎉</span>
               <p style="font-size:0.9rem; font-weight:700; color:#16a34a;">All medications taken!</p>
               <p style="font-size:0.75rem; color:var(--text-muted);">Great job staying on track today</p>
             </div>`
        : `<div style="display:flex; align-items:center; gap:0.6rem; padding:0.9rem 0.3rem; color:var(--text-muted);">
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
               <div><p style="font-size:0.8rem; font-weight:600; font-style:italic;">No more today</p><p style="font-size:0.72rem;">Stay hydrated!</p></div>
             </div>`
      }
      </div>

      <!-- FAB -->
      <div id="fab-add-med" style="position:fixed; bottom:5.5rem; right:calc(50% - 155px); width:50px; height:50px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(0,82,204,0.4); cursor:pointer; z-index:30;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
      </div>
    </div>`;
  }

  // ── Month View ────────────────────────────────────────────
  function buildMonthBlock(month, year) {
    const data = monthData(month, year);
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    let cells = '';
    for (let i = 0; i < firstDay; i++) cells += `<div></div>`;

    for (let d = 1; d <= days; d++) {
      const key = `${year}-${month}-${d}`;
      const isToday = key === todayKey;
      const doses = data[d] || [];

      cells += `
        <div class="cal-day" data-iso="${new Date(year, month, d).toISOString()}"
             style="display:flex; flex-direction:column; align-items:center; cursor:pointer; padding:0.15rem 0.05rem;">
          <div style="width:26px; height:26px; border-radius:50%;
                      background:${isToday ? 'var(--primary)' : 'transparent'};
                      display:flex; align-items:center; justify-content:center; margin-bottom:2px;">
            <span style="font-size:0.75rem; font-weight:${isToday ? '700' : '500'};
                         color:${isToday ? 'white' : 'var(--text-main)'};">${d}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:2px; align-items:center;">
            ${doses.map(dose => `
              <div style="width:4px; height:4px; border-radius:50%;
                          background:${dose.taken ? dose.color : '#e2e8f0'};"></div>
            `).join('')}
          </div>
        </div>`;
    }

    return `
      <div style="margin-bottom:1.6rem;">
        <p style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:0.75rem;">
          ${MONTHS[month]} <span style="font-size:0.8rem; color:var(--text-muted); font-weight:500;">${year}</span>
        </p>
        <div style="display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:0.3rem;">
          ${DAY_SHORT.map(d => `<p style="text-align:center; font-size:0.62rem; font-weight:600; color:var(--text-muted);">${d}</p>`).join('')}
        </div>
        <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:3px 0;">
          ${cells}
        </div>
      </div>`;
  }

  function monthView() {
    // Show 6 months: 3 past + current + 2 future
    let blocks = '';
    for (let offset = -3; offset <= 2; offset++) {
      let m = today.getMonth() + offset;
      let y = today.getFullYear();
      if (m < 0) { m += 12; y--; }
      if (m > 11) { m -= 12; y++; }
      blocks += buildMonthBlock(m, y);
    }

    return `
    <div style="display:flex; flex-direction:column; height:100%;">

      <!-- STATIC header (does NOT scroll) -->
      <div style="padding:1.5rem 1.2rem 0.8rem; flex-shrink:0; background:white;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0;">
          <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-main);">Calendar</h2>
          <div style="display:flex; gap:0.6rem; align-items:center;">
            <button id="overview-btn" title="Month Overview"
                    style="width:36px; height:36px; background:#eff6ff; border:none; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
            </button>
            <div class="view-toggle-wrap">
              <button class="view-toggle-btn${view === 'day' ? ' active' : ''}" id="vt-day">Day</button>
              <button class="view-toggle-btn${view === 'month' ? ' active' : ''}" id="vt-month">Month</button>
            </div>
          </div>
        </div>
      </div>

      <!-- SCROLLABLE months -->
      <div id="months-scroll" style="flex:1; overflow-y:auto; scrollbar-width:none; padding:0.8rem 1.2rem 5rem;">
        ${blocks}
      </div>
    </div>

    <!-- Overview bottom sheet (hidden by default) -->
    <div id="overview-sheet" style="display:none; position:fixed; bottom:0; left:50%; transform:translateX(-50%);
         width:360px; background:white; border-radius:24px 24px 0 0; padding:1.5rem 1.5rem 6rem;
         box-shadow:0 -10px 40px rgba(0,0,0,0.15); z-index:50;">
      <div style="width:40px; height:4px; background:#e2e8f0; border-radius:50px; margin:0 auto 1.2rem;"></div>
      <h3 style="font-weight:800; font-size:1rem; color:var(--text-main); margin-bottom:1rem;">This Month's Overview</h3>
      ${(() => {
        const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const data = monthData(today.getMonth(), today.getFullYear());
        return meds.map((m, mi) => {
          const taken = Object.values(data).filter(d => d[mi]?.taken).length;
          const pct = Math.round((taken / days) * 100);
          return `
            <div style="margin-bottom:0.75rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span style="font-size:0.82rem; color:var(--text-muted);">${m.name}</span>
                <span style="font-size:0.82rem; font-weight:700; color:var(--text-main);">${taken}/${days} days</span>
              </div>
              <div style="background:#f1f5f9; border-radius:50px; height:6px; overflow:hidden;">
                <div style="background:${m.color}; height:100%; width:${pct}%;"></div>
              </div>
            </div>`;
        }).join('');
      })()}
    </div>`;
  }

  // ── Helpers ───────────────────────────────────────────────
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  // ── Render ────────────────────────────────────────────────
  const render = (container) => {
    container.innerHTML = view === 'day' ? dayView() : monthView();

    // View toggle
    container.querySelector('#vt-day')?.addEventListener('click', () => { view = 'day'; render(container); });
    container.querySelector('#vt-month')?.addEventListener('click', () => { view = 'month'; render(container); });

    // Day view: med check toggle (circle/circle-check)
    container.querySelectorAll('.med-check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const med = meds.find(m => m.id === id);
        if (med) { med.taken = !med.taken; render(container); }
      });
    });

    // Day view: week strip click
    container.querySelectorAll('.day-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        selectedDate = new Date(chip.dataset.date);
        render(container);
      });
    });

    // Month view: day click → switch to day view for that date
    container.querySelectorAll('.cal-day').forEach(cell => {
      cell.addEventListener('click', () => {
        selectedDate = new Date(cell.dataset.iso);
        view = 'day';
        render(container);
      });
    });

    // Overview sheet toggle
    const overviewBtn = container.querySelector('#overview-btn');
    const overviewSheet = container.querySelector('#overview-sheet');
    if (overviewBtn && overviewSheet) {
      overviewBtn.addEventListener('click', () => {
        overviewSheet.style.display = overviewSheet.style.display === 'none' ? 'block' : 'none';
      });
      // Tap outside to close
      container.addEventListener('click', e => {
        if (!e.target.closest('#overview-sheet') && !e.target.closest('#overview-btn')) {
          if (overviewSheet) overviewSheet.style.display = 'none';
        }
      });
    }

    // Scroll to current month in month view
    if (view === 'month') {
      const scroll = container.querySelector('#months-scroll');
      if (scroll) {
        // 3rd block = current month (offset 0 from today)
        const blocks = scroll.children;
        if (blocks[3]) blocks[3].scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }
  };

  return { render };
};
