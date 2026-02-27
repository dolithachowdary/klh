import { MedicationTab } from './Medication.js';

export const Dashboard = (parent, user) => {
    let activeTab = 'home';

    // Lucide SVG paths for each tab
    const icons = {
        home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        reports: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`,
        medication: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`,
        profile: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    };

    const tabs = [
        { id: 'home', label: 'Home' },
        { id: 'reports', label: 'Reports' },
        { id: 'medication', label: 'Medication' },
        { id: 'profile', label: 'Profile' },
    ];

    const homeContent = () => `
    <div class="tab-content fade-in">
      <div class="dashboard-header">
        <p style="opacity: 0.8; font-size: 0.9rem;">Welcome back,</p>
        <h1 style="font-size: 1.8rem; font-weight: 700;">${user?.name || 'User'}</h1>
        <div id="logout-btn" style="position: absolute; top: 2.5rem; right: 1.5rem; width: 44px; height: 44px; border-radius: 14px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Logout">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </div>
      </div>

      <div class="health-score-card">
        <div>
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.2rem; color: var(--text-main);">Health Score</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem;">You're doing great!</p>
        </div>
        <div class="score-circle">78</div>
      </div>

      <div style="padding: 0 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-weight: 700;">Daily Medication</h3>
          <span style="color: var(--primary); font-size: 0.85rem; font-weight: 600; cursor:pointer;" id="tab-medication-link">View All</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
          <div style="background: white; border-radius: 20px; padding: 1rem 1.2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 44px; height: 44px; background: #fee2e2; border-radius: 14px; display: flex; align-items: center; justify-content: center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg></div>
              <div><p style="font-weight: 700; color: var(--text-main); font-size:0.95rem;">Aspirin</p><p style="font-size: 0.78rem; color: var(--text-muted);">8:00 AM · 500mg</p></div>
            </div>
            <div style="width: 22px; height: 22px; border: 2px solid #e2e8f0; border-radius: 6px;"></div>
          </div>
          <div style="background: white; border-radius: 20px; padding: 1rem 1.2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 44px; height: 44px; background: #dcfce7; border-radius: 14px; display: flex; align-items: center; justify-content: center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.7 10-10 10Z"/><path d="M19 21c-2.43-1.84-2.8-5.59-3.41-8.31"/></svg></div>
              <div><p style="font-weight: 700; color: var(--text-main); font-size:0.95rem;">Vitamin D</p><p style="font-size: 0.78rem; color: var(--text-muted);">2:00 PM · 1 Tab</p></div>
            </div>
            <div style="width: 22px; height: 22px; border: 2px solid #e2e8f0; border-radius: 6px;"></div>
          </div>
        </div>

        <h3 style="margin: 1.5rem 0 1rem 0; font-weight: 700;">Quick Actions</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding-bottom: 1rem;">
          <div style="background: white; padding: 1.2rem; border-radius: 20px; cursor: pointer; border: 1px solid #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
            <div style="width: 42px; height: 42px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.8rem;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg></div>
            <p style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">Upload Report</p>
            <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">PDF or Image</p>
          </div>
          <div style="background: white; padding: 1.2rem; border-radius: 20px; cursor: pointer; border: 1px solid #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
            <div style="width: 42px; height: 42px; background: #fdf2f8; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.8rem;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#db2777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></div>
            <p style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">Talk to AI</p>
            <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Health Assistant</p>
          </div>
        </div>
      </div>
    </div>
  `;

    const placeholderTab = (title, icon) => `
    <div class="tab-content fade-in" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:70%; gap:1rem; color: var(--text-muted);">
      ${icon}
      <p style="font-size:1.1rem; font-weight:600; color:var(--text-main);">${title}</p>
      <p style="font-size:0.85rem;">Coming soon</p>
    </div>
  `;

    const medicationContent = (bodyEl) => {
        const tab = MedicationTab();
        tab.render(bodyEl);
    };

    const profileTab = () => `
    <div class="tab-content fade-in" style="padding: 2rem 1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:800; color:var(--text-main); margin-bottom:0.3rem;">${user?.name || 'User'}</h2>
      <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1.5rem;">${user?.email || ''}</p>

      <div style="background:white; border-radius:20px; border:1px solid #f1f5f9; overflow:hidden;">
        ${[['Age', user?.age || '—'], ['Gender', user?.gender || '—'], ['Weight', user?.weight ? user.weight + ' kg' : '—'], ['Height', user?.height ? user.height + ' cm' : '—']].map(([k, v]) => `
        <div style="display:flex; justify-content:space-between; padding:1rem 1.2rem; border-bottom:1px solid #f8fafc;">
          <span style="color:var(--text-muted); font-size:0.9rem;">${k}</span>
          <span style="font-weight:600; color:var(--text-main); font-size:0.9rem;">${v}</span>
        </div>`).join('')}
        <div style="display:flex; justify-content:space-between; padding:1rem 1.2rem;">
          <span style="color:var(--text-muted); font-size:0.9rem;">Conditions</span>
          <span style="font-weight:600; color:var(--text-main); font-size:0.9rem; text-align:right; max-width:55%;">${Array.isArray(user?.conditions) ? user.conditions.join(', ') || '—' : user?.conditions || '—'}</span>
        </div>
      </div>

      <button id="logout-btn" style="width:100%; margin-top:2rem; padding:1rem; border-radius:50px; border:none; background:#fee2e2; color:#dc2626; font-weight:700; font-size:0.95rem; cursor:pointer; font-family:'Poppins',sans-serif;">Sign Out</button>
    </div>
  `;

    const getTabContent = () => {
        switch (activeTab) {
            case 'home': return homeContent();
            case 'reports': return placeholderTab('Reports', icons.reports);
            case 'medication': return '';
            case 'profile': return profileTab();
            default: return homeContent();
        }
    };

    const render = () => {
        parent.innerHTML = `
      <div style="height:100%; display:flex; flex-direction:column; overflow:hidden;">
        <!-- Scrollable content area -->
        <div id="tab-body" style="flex:1; overflow-y:auto; scrollbar-width:none;">
          ${getTabContent()}
        </div>

        <!-- Bottom Tab Bar -->
        <nav class="bottom-nav">
          ${tabs.map(t => `
            <button class="bottom-nav-tab ${activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">
              ${icons[t.id]}
              <span>${t.label}</span>
            </button>
          `).join('')}
        </nav>
      </div>
    `;

        // Tab switching
        parent.querySelectorAll('.bottom-nav-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                render();
            });
        });

        // Render medication tab separately (has its own state)
        if (activeTab === 'medication') {
            const body = parent.querySelector('#tab-body');
            const medTab = MedicationTab();
            medTab.render(body);
        }

        // Logout
        parent.addEventListener('click', e => {
            if (e.target.closest('#logout-btn')) {
                localStorage.removeItem('user');
                location.reload();
            }
            if (e.target.closest('#tab-medication-link')) {
                activeTab = 'medication';
                render();
            }
        });
    };

    render();
};
