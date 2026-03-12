import { MedicationTab } from './Medication.js';
import { AiChat } from './AiChat.js';
import { ReportsPage } from './Reports.js';
import { ReportView } from './ReportView.js';


export const Dashboard = (parent, user) => {
    let activeTab = 'home';
    let latestReport = null;
    let loadingReport = true;

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
            <p style="font-size:0.68rem; color:var(--text-muted); font-weight:500;">Good Morning,</p>
            <p style="font-size:0.95rem; font-weight:700; color:var(--text-main);">${user?.name || 'User'}</p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <div id="open-chat-btn" style="width:38px; height:38px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 12px rgba(0,82,204,0.2);" title="AI Assistant">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6V2H8"/><path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/><path d="M2 12h2"/><path d="M9 11v2"/><path d="M15 11v2"/><path d="M20 12h2"/>
            </svg>
          </div>
        </div>
      </div>

      <div style="padding: 1.5rem;">
        <!-- Latest Report Section -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.7rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-main);">Latest Report</h3>
          <span id="view-all-reports" style="color:var(--primary); font-size:0.75rem; font-weight:600; cursor:pointer;">View All</span>
        </div>

        <div id="latest-report-container" style="margin-bottom:1.6rem;">
          ${loadingReport ? `
            <div style="background:white; border-radius:18px; padding:2rem; text-align:center; border:1px solid #f1f5f9;">
              <p style="font-size:0.8rem; color:var(--text-muted);">Loading latest insights...</p>
            </div>
          ` : latestReport ? `
            <div style="background:white; border-radius:18px; box-shadow:0 4px 18px rgba(0,0,0,0.06); border:1px solid #f1f5f9; overflow:hidden;">
              <div style="display:flex; align-items:center; gap:0.8rem; padding:1rem 1rem 0.85rem;">
                <div style="width:38px; height:38px; background:#eff6ff; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
                </div>
                <div style="flex:1; min-width:0;">
                  <p style="font-weight:700; font-size:0.85rem; color:var(--text-main);">${latestReport.lab_name || 'General Report'}</p>
                  <p style="font-size:0.68rem; color:var(--text-muted); margin-top:1px;">
                    ${latestReport.report_date ? new Date(latestReport.report_date).toLocaleDateString() : 'Recent'} · ${latestReport.risk_level || 'Normal'}
                  </p>
                </div>
              </div>
              <div style="margin:0.8rem 0.9rem 0.9rem; background:#eff6ff; border-radius:13px; padding:0.7rem 0.9rem; display:flex; gap:0.6rem; align-items:flex-start;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--primary)" stroke="none" style="flex-shrink:0; margin-top:2px;"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12" stroke="white" stroke-width="2"/><line x1="12" x2="12.01" y1="16" y2="16" stroke="white" stroke-width="2"/></svg>
                <div>
                  <p style="font-size:0.73rem; font-weight:700; color:var(--primary); margin-bottom:3px;">Quick Insight</p>
                  <p style="font-size:0.74rem; color:#475569; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                    ${latestReport.summary || 'No summary available.'}
                  </p>
                </div>
              </div>
            </div>
          ` : `
            <div style="background:#f8fafc; border-radius:18px; padding:2rem; text-align:center; border:1px dashed #cbd5e1; cursor:pointer;" id="empty-report-btn">
              <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">No reports found</p>
              <p style="font-size:0.75rem; color:var(--primary); font-weight:700;">+ Upload your first lab report</p>
            </div>
          `}
        </div>

        <!-- Medibot Quick Actions -->
        <div style="background:white; border-radius:24px; padding:1.2rem; margin-bottom:1.6rem; box-shadow:0 8px 30px rgba(0,0,0,0.04); border:1px solid #f1f5f9; display:flex; flex-direction:column; gap:1rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
            </svg>
            <p style="font-weight:700; color:var(--text-main); font-size:0.95rem; letter-spacing:-0.2px;">Medibot</p>
          </div>
          
          <div id="home-ask-bar" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:0.8rem 1rem; display:flex; align-items:center; gap:0.7rem; cursor:pointer;" title="Ask AI">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span style="font-size:0.78rem; color:#94a3b8; font-weight:500;">Ask anything about your health...</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem;">
            <div id="home-upload-btn" style="background:var(--primary); color:white; border-radius:14px; padding:0.85rem; display:flex; align-items:center; justify-content:center; gap:0.5rem; cursor:pointer; box-shadow:0 4px 12px rgba(0,82,204,0.22);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span style="font-size:0.82rem; font-weight:700;">Upload Lab</span>
            </div>
            <div id="home-chat-btn" style="background:#eff6ff; color:var(--primary); border-radius:14px; padding:0.85rem; display:flex; align-items:center; justify-content:center; gap:0.5rem; cursor:pointer; border:1.5px solid #dbeafe;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style="font-size:0.82rem; font-weight:700;">Deep Chat</span>
            </div>
          </div>
        </div>

        <!-- Today's Meds Section -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-main);">Today's Meds</h3>
          <span style="color:var(--text-muted); font-size:0.75rem; font-weight:600;">3 of 4 taken</span>
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
                  <p style="font-weight:700; font-size:0.82rem; color:var(--text-main);">${m.name}</p>
                  <p style="font-size:0.7rem; color:var(--text-muted);">${m.dose} · ${m.time}</p>
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
      <h2 style="font-size:1.3rem; font-weight:700; color:var(--text-main); margin-bottom:0.2rem;">${user?.name || 'User'}</h2>
      <p style="color:var(--text-muted); font-size:0.82rem; margin-bottom:1.5rem;">${user?.email || ''}</p>

      <div style="background:white; border-radius:20px; border:1px solid #f1f5f9; overflow:hidden;">
        ${[['Age', user?.age || '—'], ['Gender', user?.gender || '—'], ['Weight', user?.weight ? user.weight + ' kg' : '—'], ['Height', user?.height ? user.height + ' cm' : '—']].map(([k, v]) => `
        <div style="display:flex; justify-content:space-between; padding:0.9rem 1.2rem; border-bottom:1px solid #f8fafc;">
          <span style="color:var(--text-muted); font-size:0.85rem;">${k}</span>
          <span style="font-weight:600; color:var(--text-main); font-size:0.85rem;">${v}</span>
        </div>`).join('')}
        <div style="display:flex; justify-content:space-between; padding:0.9rem 1.2rem;">
          <span style="color:var(--text-muted); font-size:0.85rem;">Conditions</span>
          <span style="font-weight:600; color:var(--text-main); font-size:0.85rem; text-align:right; max-width:55%;">${Array.isArray(user?.conditions) ? user.conditions.join(', ') || '—' : user?.conditions || '—'}</span>
        </div>
      </div>

      <button id="logout-btn" style="width:100%; margin-top:2rem; padding:1rem; border-radius:50px; border:none; background:#fee2e2; color:#dc2626; font-weight:700; font-size:0.95rem; cursor:pointer; font-family:'Poppins',sans-serif;">Sign Out</button>
    </div>
  `;

    const openReportsPage = () => {
        activeTab = 'reports';
        render();
        const tabBody = parent.querySelector('#tab-body');
        if (tabBody) ReportsPage(tabBody, user);
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
            const medTab = MedicationTab(user);
            medTab.render(body);
        }

        // Logout + chat + tab-medication-link + view-all-reports + FAB upload
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
            if (e.target.closest('#latest-report-container') && latestReport) {
                ReportView(parent, {
                    report: latestReport,
                    onBack: () => render()
                });
            }
            if (e.target.closest('#home-upload-btn')) {
                AiChat(parent, {
                    user,
                    onBack: () => render(),
                    autoOpenPin: true
                });
            }
            if (e.target.closest('#home-chat-btn') || e.target.closest('#home-ask-bar')) {
                AiChat(parent, {
                    onBack: () => render(),
                    user,
                });
            }
            if (e.target.closest('#empty-report-btn')) {
                 AiChat(parent, {
                    user,
                    onBack: () => render(),
                    autoOpenPin: true
                });
            }
        });


    };

    const fetchLatestData = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`http://localhost:3001/api/report/user/${user.id}`);
            if (res.ok) {
                const reports = await res.json();
                latestReport = reports.length > 0 ? reports[0] : null;
            }
        } catch (err) {
            console.error('Failed to fetch latest report:', err);
        } finally {
            loadingReport = false;
            if (activeTab === 'home') render();
        }
    };

    fetchLatestData();
    render();
};
