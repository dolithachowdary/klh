import { MedicationTab } from './Medication.js';
import { AiChat } from './AiChat.js';
import { ReportsPage } from './Reports.js';


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
      <!-- Clean White Header -->
      <div style="background:white; padding:1.2rem 1.4rem 1rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f1f5f9;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div style="width:40px; height:40px; background:#e0ebff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0;">🧑</div>
          <div>
            <p style="font-size:0.72rem; color:var(--text-muted); font-weight:500;">Good Morning,</p>
            <p style="font-size:1rem; font-weight:800; color:var(--text-main);">${user?.name || 'User'}</p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <div id="open-chat-btn" style="width:38px; height:38px; border-radius:50%; background:#f1f5f9; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="AI Assistant">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/>
            </svg>
          </div>
          <div style="width:38px; height:38px; border-radius:50%; background:#f1f5f9; display:flex; align-items:center; justify-content:center; cursor:pointer;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
        </div>
      </div>

      <div style="padding: 1.5rem;">
        <!-- Latest Report -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.7rem;">
          <h3 style="font-size:1rem; font-weight:800; color:var(--text-main);">Latest Report</h3>
          <span id="view-all-reports" style="color:var(--primary); font-size:0.8rem; font-weight:600; cursor:pointer;">View All</span>
        </div>

        <div style="background:white; border-radius:18px; box-shadow:0 4px 18px rgba(0,0,0,0.06); border:1px solid #f1f5f9; overflow:hidden; margin-bottom:1.4rem;">

          <!-- Report title row -->
          <div style="display:flex; align-items:center; gap:0.8rem; padding:1rem 1rem 0.85rem;">
            <div style="width:38px; height:38px; background:#eff6ff; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
            </div>
            <div style="flex:1; min-width:0;">
              <p style="font-weight:700; font-size:0.88rem; color:var(--text-main);">Blood Panel Results</p>
              <p style="font-size:0.7rem; color:var(--text-muted); margin-top:1px;">Updated 2 days ago</p>
            </div>
          </div>



          <!-- Quick Insight -->
          <div style="margin:0.8rem 0.9rem 0.9rem; background:#eff6ff; border-radius:13px; padding:0.7rem 0.9rem; display:flex; gap:0.6rem; align-items:flex-start;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--primary)" stroke="none" style="flex-shrink:0; margin-top:2px;"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12" stroke="white" stroke-width="2"/><line x1="12" x2="12.01" y1="16" y2="16" stroke="white" stroke-width="2"/></svg>
            <div>
              <p style="font-size:0.73rem; font-weight:700; color:var(--primary); margin-bottom:3px;">Quick Insight</p>
              <p style="font-size:0.74rem; color:#475569; line-height:1.5;">Your Vitamin D levels are slightly low. Consider 15 mins of morning sun or a supplement as discussed with your AI assistant.</p>
            </div>
          </div>
        </div>

        <!-- Today's Meds Section -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h3 style="font-size:1rem; font-weight:800; color:var(--text-main);">Today's Meds</h3>
          <span style="color:var(--text-muted); font-size:0.78rem; font-weight:600;">3 of 4 taken</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.65rem; padding-bottom:5rem;">
          ${[
            { name: 'Multivitamin', dose: '1 Tablet', time: '08:00 AM', taken: true },
            { name: 'Metformin', dose: '500 mg', time: '01:00 PM', taken: true },
            { name: 'Aspirin', dose: '100 mg', time: '09:00 PM', taken: false },
        ].map(m => `
            <div style="background:white; border-radius:16px; padding:0.85rem 1rem; display:flex; align-items:center; justify-content:space-between; border:1px solid #f1f5f9; box-shadow:0 2px 10px rgba(0,0,0,0.03);" id="tab-medication-link">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:40px; height:40px; background:${m.taken ? '#dcfce7' : '#f1f5f9'}; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  ${m.taken
                ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`
            }
                </div>
                <div>
                  <p style="font-weight:700; font-size:0.87rem; color:var(--text-main);">${m.name}</p>
                  <p style="font-size:0.72rem; color:var(--text-muted);">${m.dose} · ${m.time}</p>
                </div>
              </div>
              ${m.taken
                ? `<span style="background:#dcfce7; color:#16a34a; font-size:0.62rem; font-weight:700; padding:3px 9px; border-radius:50px; letter-spacing:0.3px; flex-shrink:0;">TAKEN</span>`
                : `<span style="background:#f1f5f9; color:#64748b; font-size:0.62rem; font-weight:700; padding:3px 9px; border-radius:50px; letter-spacing:0.3px; flex-shrink:0;">PENDING</span>`
            }
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Upload Report FAB -->
      <div id="upload-report-fab" style="position:sticky; bottom:1rem; display:flex; justify-content:flex-end; padding-right:1rem; pointer-events:none;">
        <div style="background:var(--primary); color:white; border-radius:50px; padding:0.65rem 1.1rem; display:flex; align-items:center; gap:0.5rem; box-shadow:0 6px 20px rgba(0,82,204,0.38); cursor:pointer; pointer-events:all;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
          <span style="font-size:0.8rem; font-weight:700; font-family:'Poppins',sans-serif;">Upload Report</span>
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

    const openReportsPage = () => {
        activeTab = 'reports';
        render();
        const tabBody = parent.querySelector('#tab-body');
        if (tabBody) ReportsPage(tabBody);
    };

    const getTabContent = () => {
        switch (activeTab) {
            case 'home': return homeContent();
            case 'reports': return '';
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
                if (btn.dataset.tab === 'reports') {
                    openReportsPage();
                } else {
                    activeTab = btn.dataset.tab;
                    render();
                }
            });
        });

        // Render medication tab separately (has its own state)
        if (activeTab === 'medication') {
            const body = parent.querySelector('#tab-body');
            const medTab = MedicationTab();
            medTab.render(body);
        }

        // Logout + chat + tab-medication-link + view-all-reports
        parent.addEventListener('click', e => {
            if (e.target.closest('#logout-btn')) {
                localStorage.removeItem('user');
                location.reload();
            }
            if (e.target.closest('#tab-medication-link')) {
                activeTab = 'medication';
                render();
            }
            if (e.target.closest('#open-chat-btn')) {
                AiChat(parent, {
                    onBack: () => render(),
                    user,
                });
            }
            if (e.target.closest('#view-all-reports')) {
                openReportsPage();
            }
        });


    };

    render();
};
