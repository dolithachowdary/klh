export const ReportsPage = (parent) => {
  const reports = [
    { lab: 'City Lab Diagnostics', date: 'Oct 24, 2023', status: 'abnormal', markers: 2 },
    { lab: 'Central Health Lab', date: 'Sep 12, 2023', status: 'normal', markers: 0 },
    { lab: 'Global Diagnostics', date: 'Aug 05, 2023', status: 'abnormal', markers: 1 },
    { lab: 'Evergreen Medical Lab', date: 'Jun 18, 2023', status: 'normal', markers: 0 },
    { lab: 'Apollo Health Centre', date: 'Mar 02, 2023', status: 'normal', markers: 0 },
  ];

  let query = '';

  const docIcon = `
    <div style="width:42px; height:42px; background:#eff6ff; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" x2="8" y1="13" y2="13"/>
        <line x1="16" x2="8" y1="17" y2="17"/>
      </svg>
    </div>`;

  const chevron = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>`;

  function statusBadge(r) {
    if (r.status === 'normal') {
      return `<span style="background:#dcfce7; color:#16a34a; font-size:0.68rem; font-weight:700; padding:3px 10px; border-radius:50px;">Normal</span>`;
    }
    const label = r.markers === 1 ? '1 Abnormal Marker' : `${r.markers} Abnormal Markers`;
    return `<span style="background:#fee2e2; color:#dc2626; font-size:0.68rem; font-weight:700; padding:3px 10px; border-radius:50px;">${label}</span>`;
  }

  function renderList() {
    const filtered = reports.filter(r =>
      r.lab.toLowerCase().includes(query.toLowerCase()) ||
      r.date.toLowerCase().includes(query.toLowerCase())
    );
    if (!filtered.length) {
      return `<p style="text-align:center; color:var(--text-muted); margin-top:2rem; font-size:0.85rem;">No reports found.</p>`;
    }
    return filtered.map(r => `
      <div style="background:white; border-radius:18px; padding:1rem 1.1rem; display:flex; align-items:center; gap:0.85rem; box-shadow:0 2px 12px rgba(0,0,0,0.04); border:1px solid #f1f5f9; cursor:pointer;">
        ${docIcon}
        <div style="flex:1; min-width:0;">
          <p style="font-weight:700; font-size:0.9rem; color:var(--text-main);">${r.lab}</p>
          <p style="font-size:0.72rem; color:var(--text-muted); margin:2px 0 6px;">${r.date}</p>
          ${statusBadge(r)}
        </div>
        ${chevron}
      </div>
    `).join('');
  }

  function render() {
    parent.innerHTML = `
      <div style="height:100%; display:flex; flex-direction:column; background:#f8fafc;">

        <!-- Header -->
        <div style="background:white; padding:1.1rem 1.2rem 0.9rem; border-bottom:1px solid #f1f5f9; flex-shrink:0;">
          <p style="font-size:1rem; font-weight:800; color:var(--text-main); text-align:center;">Reports History</p>
        </div>

        <!-- Search -->
        <div style="padding:0.9rem 1.2rem 0.5rem; flex-shrink:0;">
          <div style="background:white; border-radius:50px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:0.6rem; padding:0.65rem 1rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input id="reports-search" type="text" placeholder="Search by lab or date"
              style="border:none; outline:none; font-size:0.82rem; font-family:'Poppins',sans-serif; color:var(--text-main); background:transparent; width:100%;"
              value="${query}" />
          </div>
        </div>

        <!-- List -->
        <div id="reports-list" style="flex:1; overflow-y:auto; padding:0.5rem 1.2rem 1.5rem; display:flex; flex-direction:column; gap:0.75rem; scrollbar-width:none;">
          ${renderList()}
        </div>
      </div>
    `;



    parent.querySelector('#reports-search').addEventListener('input', e => {
      query = e.target.value;
      parent.querySelector('#reports-list').innerHTML = renderList();
    });
  }

  render();
};
