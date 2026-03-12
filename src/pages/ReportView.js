import { AiChat } from './AiChat.js';

export const ReportView = (parent, { report, fileName, onBack, user }) => {
  const markers = Array.isArray(report.markers) ? report.markers : (typeof report.markers === 'string' ? JSON.parse(report.markers) : []);
  const abnormalCount = markers.filter(m => (m.status || '').toLowerCase() !== 'normal').length;

  function getStatusStyle(status = '') {
    const s = status.toLowerCase();
    if (s === 'normal') return { color: '#22c55e', bg: '#dcfce7', label: 'NORMAL', bar: '#22c55e' };
    if (s === 'low' || s === 'critical' || s === 'high') return { color: '#ef4444', bg: '#fee2e2', label: s.toUpperCase(), bar: '#ef4444' };
    if (s === 'borderline' || s === 'warning') return { color: '#f59e0b', bg: '#fef3c7', label: 'BORDERLINE', bar: '#f59e0b' };
    return { color: '#64748b', bg: '#f1f5f9', label: s.toUpperCase() || 'INFO', bar: '#cbd5e1' };
  }

  function calculatePercentage(value, range) {
    if (!range || range === '—') return 50;
    const val = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
    if (isNaN(val)) return 50;

    const rangeParts = range.match(/[0-9.]+/g);
    if (!rangeParts) return 50;

    if (range.includes('-') && rangeParts.length >= 2) {
      const min = parseFloat(rangeParts[0]);
      const max = parseFloat(rangeParts[1]);
      if (val < min) return Math.max(8, (val / min) * 33);
      if (val > max) return Math.min(95, 66 + ((val - max) / (max || 1)) * 33);
      return 33 + ((val - min) / ((max - min) || 1)) * 33;
    } else if (range.includes('<')) {
      const max = parseFloat(rangeParts[0]);
      if (val <= max) return Math.max(8, (val / (max || 1)) * 66);
      return Math.min(95, 66 + ((val - max) / (max || 1)) * 33);
    } else if (range.includes('>')) {
      const min = parseFloat(rangeParts[0]);
      if (val >= min) return Math.min(95, 33 + ((val - min) / (min || 1)) * 33);
      return Math.max(8, (val / (min || 1)) * 33);
    }
    return 50;
  }

  const shareIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`;
  
  const docIcon = `
    <div style="width:52px; height:52px; background:#eff6ff; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" x2="8" y1="13" y2="13"/>
        <line x1="16" x2="8" y1="17" y2="17"/>
      </svg>
    </div>`;

  parent.innerHTML = `
    <div style="height:100%; display:flex; flex-direction:column; background:white; font-family:'Poppins',sans-serif; position:relative;">
      
      <!-- Adjusted Header -->
      <div style="padding:0.8rem 1.2rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f1f5f9; flex-shrink:0;">
        <button id="report-view-back" style="background:none; border:none; cursor:pointer; padding:5px; display:flex; align-items:center;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 style="font-size:0.92rem; font-weight:700; color:#1e293b; margin:0;">Report Details</h2>
        <button style="background:none; border:none; cursor:pointer; padding:5px; display:flex; align-items:center;">
          ${shareIcon}
        </button>
      </div>

      <div style="flex:1; overflow-y:auto; padding:1.2rem 1.2rem 5rem; scrollbar-width:none;">
        
        <!-- Lab Info Header -->
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
          ${docIcon}
          <div>
            <h1 style="font-size:1rem; font-weight:700; color:#1e293b; margin:0 0 0.2rem;">${report.lab_name || 'General Diagnostics'}</h1>
            <div style="display:flex; align-items:center; gap:0.4rem; color:#64748b; font-size:0.72rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>${report.report_date ? new Date(report.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
            </div>
            <p style="font-size:0.68rem; color:#94a3b8; font-weight:600; margin:0.1rem 0 0; text-transform:uppercase; letter-spacing:0.5px;">REPORT ID: #${report.id ? report.id.substring(0,8).toUpperCase() : '12345'}</p>
          </div>
        </div>

        <!-- Abnormal Markers Alert -->
        ${abnormalCount > 0 ? `
          <div style="background:#fff1f2; border-radius:18px; padding:1rem; border:1px solid #ffe4e6; margin-bottom:1.6rem; display:flex; gap:0.8rem; align-items:flex-start;">
            <div style="width:36px; height:36px; background:#f43f5e; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 9 4.1 7H7.9l4.1-7Z"/><path d="M12 2v2"/><path d="M12 18v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/></svg>
            </div>
            <div>
              <h3 style="font-size:0.88rem; font-weight:700; color:#9f1239; margin:0 0 0.2rem;">${abnormalCount} Abnormal Markers</h3>
              <p style="font-size:0.72rem; color:#be123c; line-height:1.4; margin:0;">Your results show markers outside the standard reference range. We recommend a follow-up.</p>
            </div>
          </div>
        ` : ''}

        <h3 style="font-size:0.9rem; font-weight:700; color:#1e293b; margin-bottom:1rem;">Laboratory Results</h3>

        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${markers.map(m => {
            const style = getStatusStyle(m.status);
            const percentage = calculatePercentage(m.value, m.reference_range);

            return `
              <div style="background:white; border-radius:16px; padding:1.1rem; border:1px solid #f1f5f9; box-shadow:0 2px 10px rgba(0,0,0,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.1rem;">
                  <p style="font-weight:700; font-size:0.85rem; color:#1e293b; margin:0;">${m.name}</p>
                  <span style="background:${style.bg}; color:${style.color}; font-size:0.58rem; font-weight:800; padding:2px 8px; border-radius:50px; letter-spacing:0.4px;">${style.label}</span>
                </div>
                <p style="font-size:0.7rem; color:#94a3b8; margin:0 0 0.8rem;">Reference: ${m.reference_range || '—'}</p>
                
                <div style="display:flex; align-items:baseline; gap:0.3rem; margin-bottom:1rem;">
                  <span style="font-size:1.3rem; font-weight:700; color:#1e293b;">${m.value}</span>
                  <span style="font-size:0.75rem; color:#94a3b8; font-weight:600;">${m.unit || ''}</span>
                </div>

                <div style="width:100%; height:5px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                  <div style="width:${percentage}%; height:100%; background:${style.bar}; border-radius:10px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${report.recommendations?.length ? `
          <div style="margin-top:2rem;">
            <h3 style="font-size:0.9rem; font-weight:700; color:#1e293b; margin-bottom:0.8rem;">Recommendations</h3>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              ${report.recommendations.map(r => `
                <div style="background:#f8fafc; border-radius:10px; padding:0.8rem; border:1px solid #f1f5f9; display:flex; gap:0.6rem; align-items:flex-start;">
                  <div style="width:16px; height:16px; background:#0ea5e9; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <p style="font-size:0.75rem; color:#334155; line-height:1.4; margin:0;">${r}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>

      <!-- Contextual Bot Button (Bottom Left) -->
      <div id="report-chat-bot" style="position:fixed; left:1.2rem; bottom:1.5rem; width:48px; height:48px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 6px 16px rgba(0,82,204,0.3); z-index:100;" title="Ask about this report">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6V2H8"/><path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/><path d="M2 12h2"/><path d="M9 11v2"/><path d="M15 11v2"/><path d="M20 12h2"/>
        </svg>
      </div>

    </div>
  `;

  parent.querySelector('#report-view-back').addEventListener('click', onBack);
  
  parent.querySelector('#report-chat-bot').addEventListener('click', () => {
    AiChat(parent, {
      user,
      onBack: () => {
         // Re-render report view when coming back
         ReportView(parent, { report, fileName, onBack, user });
      },
      reportContext: report
    });
  });
};
