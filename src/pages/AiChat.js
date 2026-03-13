export const AiChat = (parent, { onBack, user, autoOpenPin = false, reportContext = null }) => {
  const API_BASE = window.location.origin.replace(':5173', ':3001');

  // Stateless conversation history for the current tab session
  const history = [];
  const displayMsgs = [
    {
      role: 'bot',
      text: reportContext 
        ? `I see you're looking at your **${reportContext.lab_name || 'Lab'}** report from **${reportContext.report_date ? new Date(reportContext.report_date).toLocaleDateString() : 'recently'}**. How can I help you understand these results?`
        : `Hello${user?.name ? ' ' + user.name.split(' ')[0] : ''}! 👋 I'm **MediBot**, your personal health assistant.\n\nI can help you understand your reports, medications, lab values, or anything health-related. What's on your mind today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  const quickChips = [
    { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`, label: 'Explain my reports' },
    { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`, label: 'Diet advice' },
    { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`, label: 'My medications' },
    { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label: 'Health tips' },
  ];

  let isTyping = false;
  let pendingAttachment = null;

  function formatTime(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function parseMd(text) {
    if (typeof text !== 'string') return '';
    const lines = text.split('\n');
    let html = '';
    for (const raw of lines) {
      const line = raw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('•') || line.startsWith('-')) {
        html += `<div style="display:flex;gap:6px;margin:2px 0;"><span style="color:var(--primary);font-weight:700;flex-shrink:0;">•</span><span>${line.replace(/^[•\-]\s*/, '')}</span></div>`;
      } else if (line.trim() === '') {
        html += '<div style="height:4px;"></div>';
      } else {
        html += `<div>${line}</div>`;
      }
    }
    return html;
  }

  const botAvatar = `
    <div style="width:32px; height:32px; background:linear-gradient(135deg,#0052cc,#00aaff); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
        <path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
      </svg>
    </div>`;

  const userAvatar = `
    <div style="width:32px; height:32px; background:linear-gradient(135deg,#0052cc,#4f46e5); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>`;


  async function fetchReports() {
    if (!user?.id) return [];
    try {
      const res = await fetch(`${API_BASE}/api/report/user/${user.id}`);
      return await res.json();
    } catch (err) {
      console.error('Fetch reports error:', err);
      return [];
    }
  }

  async function handleReportSelection(reportId, label) {
    if (isTyping) return;
    
    displayMsgs.push({ role: 'user', text: `Explain my ${label}`, time: formatTime(new Date()) });
    history.push({ role: 'user', content: `Explain my ${label}` });
    isTyping = true;
    refreshMessages(true);

    try {
      const reports = await fetchReports();
      const report = reports.find(r => r.id === reportId);
      
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: history, 
          userId: user?.id,
          reportContext: report
        }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || 'Sorry, something went wrong.';
      
      history.push({ role: 'assistant', content: reply });
      refreshMessages(false);
      typeWriter(reply, () => { isTyping = false; });

    } catch (err) {
      displayMsgs.push({ role: 'bot', text: 'Network error. Please try again.', time: formatTime(new Date()) });
      isTyping = false;
      refreshMessages(false);
    }
  }

  function renderMessages() {
    return displayMsgs.map(m => m.role === 'bot'
      ? `<div style="display:flex; gap:0.7rem; align-items:flex-start; margin-bottom:1rem;">
           ${botAvatar}
           <div style="max-width:72%;">
             <p style="font-size:0.6rem; color:var(--text-muted); margin-bottom:1px;">MediBot</p>
             <div style="background:white; border-radius:4px 18px 18px 18px; padding:0.7rem 0.9rem;
                         box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f1f5f9;">
               <p style="font-size:0.82rem; color:var(--text-main); line-height:1.5;">${parseMd(m.text)}</p>
               ${m.options ? `
                 <div style="display:flex; flex-direction:column; gap:0.55rem; margin-top:0.8rem;">
                   ${m.options.map(opt => `
                     <button class="report-select-btn" data-id="${opt.id}" data-label="${opt.label}"
                             style="background:#f8fafc; color:var(--primary); border:1.5px solid var(--primary); border-radius:12px; padding:0.65rem 0.9rem; font-size:0.78rem; font-weight:700; cursor:pointer; text-align:left; display:flex; align-items:center; gap:8px;">
                       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                       ${opt.label}
                     </button>
                   `).join('')}
                 </div>
               ` : ''}
             </div>
             <p style="font-size:0.58rem; color:var(--text-muted); margin-top:3px;">${m.time}</p>
           </div>
         </div>`
      : `<div style="display:flex; gap:0.7rem; align-items:flex-start; flex-direction:row-reverse; margin-bottom:1rem;">
           ${userAvatar}
           <div style="max-width:72%;">
             <p style="font-size:0.6rem; color:var(--text-muted); margin-bottom:1px; text-align:right;">You</p>
             <div style="background:var(--primary); border-radius:18px 4px 18px 18px; padding:0.7rem 0.9rem;">
               <p style="font-size:0.82rem; color:white; line-height:1.5;">${parseMd(m.text)}</p>
             </div>
             <p style="font-size:0.58rem; color:var(--text-muted); margin-top:3px; text-align:right;">${m.time}</p>
           </div>
         </div>`
    ).join('');
  }

  const typingIndicator = `
    <div id="typing-row" style="display:flex; gap:0.7rem; align-items:flex-end; margin-bottom:1rem;">
      ${botAvatar}
      <div style="background:white; border-radius:4px 18px 18px 18px; padding:0.75rem 1rem;
                  box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f1f5f9;">
        <div style="display:flex; gap:4px; align-items:center;">
          <span class="typing-dot"></span>
          <span class="typing-dot" style="animation-delay:0.2s;"></span>
          <span class="typing-dot" style="animation-delay:0.4s;"></span>
        </div>
      </div>
    </div>`;

  function scrollToBottom() {
    const el = parent.querySelector('#chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function refreshMessages(showTyping = false) {
    const el = parent.querySelector('#chat-messages');
    if (!el) return;
    el.innerHTML = renderMessages() + (showTyping ? typingIndicator : '');
    scrollToBottom();
  }

  function typeWriter(fullReply, onDone) {
    const SPEED = 12;
    let i = 0;
    const msgIdx = displayMsgs.length;
    displayMsgs.push({ role: 'bot', text: '', time: formatTime(new Date()) });

    function tick() {
      i++;
      displayMsgs[msgIdx].text = fullReply.slice(0, i);
      refreshMessages(false);
      if (i < fullReply.length) {
        setTimeout(tick, SPEED);
      } else {
        onDone();
      }
    }
    tick();
  }

  async function sendMessage(text) {
    if (isTyping) return;
    const trimmedText = text.trim();
    if (!trimmedText && !pendingAttachment) return;

    const input = parent.querySelector('#chat-input');
    if (input) input.value = '';

    if (pendingAttachment) {
      const file = pendingAttachment.file;
      clearAttachment();
      uploadAndAnalyse(file, trimmedText);
      return;
    }

    if (trimmedText.toLowerCase().includes('explain my report')) {
      isTyping = true;
      refreshMessages(true);
      const reports = await fetchReports();
      isTyping = false;
      
      if (reports.length === 0) {
        const reply = "I couldn't find any reports in your history. You can upload one using the paperclip icon! 📎";
        displayMsgs.push({ role: 'bot', text: reply, time: formatTime(new Date()) });
      } else {
        displayMsgs.push({ 
          role: 'bot', 
          text: "I found your previous reports. Which one would you like me to explain?",
          options: reports.map(r => ({
            id: r.id,
            label: `${r.lab_name || r.report_name || 'Report'} (${new Date(r.report_date).toLocaleDateString()})`
          })),
          time: formatTime(new Date()) 
        });
      }
      refreshMessages(false);
      return;
    }

    history.push({ role: 'user', content: trimmedText });
    displayMsgs.push({ role: 'user', text: trimmedText, time: formatTime(new Date()) });
    isTyping = true;
    refreshMessages(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: history, 
          userId: user?.id,
          reportContext: reportContext 
        }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || 'Sorry, something went wrong.';
      
      history.push({ role: 'assistant', content: reply });
      refreshMessages(false);
      typeWriter(reply, () => { isTyping = false; });

    } catch (err) {
      displayMsgs.push({ role: 'bot', text: 'Network error. Please check your connection.', time: formatTime(new Date()) });
      isTyping = false;
      refreshMessages(false);
    }
  }

  function clearAttachment() {
    pendingAttachment = null;
    const preview = parent.querySelector('#attachment-preview');
    if (preview) {
      preview.style.display = 'none';
      preview.innerHTML = '';
    }
  }

  function setAttachment(file) {
    const isImg = file.type.startsWith('image/');
    pendingAttachment = {
      file,
      name: file.name,
      type: file.type,
      previewUrl: isImg ? URL.createObjectURL(file) : null
    };

    const container = parent.querySelector('#attachment-preview');
    if (container) {
      container.style.display = 'flex';
      container.innerHTML = `
        <div style="background:#f1f5f9; border-radius:12px; padding:0.5rem; display:flex; align-items:center; gap:0.6rem; border:1px solid #e2e8f0; max-width:200px; position:relative;">
          ${pendingAttachment.previewUrl 
            ? `<img src="${pendingAttachment.previewUrl}" style="width:34px; height:34px; border-radius:6px; object-fit:cover;" />`
            : `<div style="width:34px; height:34px; background:white; border-radius:6px; display:flex; align-items:center; justify-content:center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
               </div>`}
          <div style="flex:1; overflow:hidden;">
            <p style="font-size:0.65rem; color:var(--text-main); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${file.name}</p>
            <p style="font-size:0.58rem; color:var(--text-muted);">Attached</p>
          </div>
          <button id="remove-attach" style="position:absolute; top:-6px; right:-6px; background:#f43f5e; color:white; border:none; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>`;
      
      container.querySelector('#remove-attach').addEventListener('click', clearAttachment);
    }
  }

  async function uploadAndAnalyse(file, extraText = null) {
    if (isTyping) return;
    isTyping = true;

    if (extraText) {
      displayMsgs.push({ role: 'user', text: extraText, time: formatTime(new Date()) });
      history.push({ role: 'user', content: extraText });
    }
    refreshMessages(true);

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.8rem;';
    overlay.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <p style="font-size:0.88rem;font-weight:700;color:var(--text-main);font-family:'Poppins',sans-serif;">Analysing your report…</p>`;
    
    if (!document.getElementById('spin-style')) {
      const s = document.createElement('style'); s.id = 'spin-style';
      s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }
    parent.appendChild(overlay);

    try {
      const form = new FormData();
      form.append('report', file);
      if (extraText) form.append('text', extraText);
      if (user) form.append('patient', JSON.stringify(user));

      const res = await fetch(`${API_BASE}/api/upload/report`, { method: 'POST', body: form });
      const data = await res.json();
      overlay.remove();

      if (!res.ok || !data.report) {
        displayMsgs.push({ role: 'bot', text: `❌ Could not analyse the file: ${data.error || 'Unknown error'}`, time: formatTime(new Date()) });
        isTyping = false;
      } else {
        const r = data.report;
        const text = [
          `📋 **${r.report_name || 'Lab Report'}** — ${r.report_date || 'Recent'}`,
          `Status: **${r.overall_status || '—'}**`,
          '',
          `**The Brief:**\n${r.brief || 'No overview available.'}`,
          '',
          `**Main Takeaways:**\n${r.summary || 'No summary available.'}`,
          '',
          `**Key Findings:**`,
          ...(r.findings || []).map(f => `• **${f.name}**: ${f.value} ${f.unit || ''} (${f.status || 'Normal'})\n  _${f.explanation || f.insight || ''}_`),
          '',
          `**Recommendations:**`,
          ...(r.recommendations || []).map(rec => `• ${rec}`),
        ].join('\n');

        displayMsgs.push({ role: 'bot', text, time: formatTime(new Date()) });
        isTyping = false;
      }
      refreshMessages(false);

    } catch (err) {
      if (overlay.parentNode) overlay.remove();
      displayMsgs.push({ role: 'bot', text: `❌ Network error: ${err.message}`, time: formatTime(new Date()) });
      isTyping = false;
      refreshMessages(false);
    }
  }

  function render() {
    parent.innerHTML = `
      <div style="height:100%; display:flex; flex-direction:column; background:#f8fafc;">
        <div style="background:white; padding:1.2rem 1.2rem 0.9rem; display:flex; align-items:center; gap:1rem;
                    border-bottom:1px solid #f1f5f9; box-shadow:0 2px 10px rgba(0,0,0,0.04); flex-shrink:0; position:relative;">
          <button id="chat-back" style="background:none; border:none; cursor:pointer; padding:0.2rem; color:var(--text-main); display:flex;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div style="flex:1; text-align:center;">
            <p style="font-weight:700; font-size:0.92rem; color:var(--text-main);">Medical Assistant</p>
            <div style="display:flex; align-items:center; justify-content:center; gap:4px; margin-top:2px;">
              <div style="width:6px; height:6px; background:#22c55e; border-radius:50%;"></div>
              <p style="font-size:0.65rem; color:#22c55e; font-weight:600;">AI is online</p>
            </div>
          </div>
          <div style="width:22px;"></div>
        </div>

        <div id="chat-messages" style="flex:1; overflow-y:auto; padding:0.5rem 1.2rem; scrollbar-width:none;">
          <div style="text-align:center; padding:1rem 0; flex-shrink:0;">
            <span style="font-size:0.67rem; color:var(--text-muted); background:#e2e8f0; padding:0.22rem 0.7rem; border-radius:50px;">
              TODAY, ${formatTime(new Date())}
            </span>
          </div>
          ${renderMessages()}
        </div>

        <div style="display:flex; gap:0.45rem; padding:0.55rem 1.2rem; overflow-x:auto; scrollbar-width:none; flex-shrink:0;">
          ${quickChips.map(c => `
            <button class="quick-chip" data-label="${c.label}"
                    style="display:flex; align-items:center; gap:5px; white-space:nowrap;
                           background:white; border:1.5px solid var(--primary); color:var(--primary);
                           border-radius:50px; padding:0.38rem 0.8rem; font-size:0.72rem; font-weight:600;
                           font-family:'Poppins',sans-serif; cursor:pointer; flex-shrink:0;">
              ${c.icon} ${c.label}
            </button>`).join('')}
        </div>

        <div id="attachment-preview" style="display:none; padding:0.5rem 1.2rem; background:white; border-top:1px solid #f1f5f9; flex-shrink:0; gap:0.5rem; align-items:center;">
        </div>

        <div style="background:white; border-top:1px solid #f1f5f9; padding:0.75rem 1rem; display:flex; gap:0.6rem; align-items:center; flex-shrink:0; position:relative;">
          <div id="pin-menu" style="display:none; position:absolute; bottom:68px; left:12px; background:white; border-radius:16px; box-shadow:0 8px 30px rgba(0,0,0,0.12); border:1px solid #f1f5f9; overflow:hidden; z-index:100; min-width:180px;">
            <button class="pin-option" data-type="camera" style="width:100%; display:flex; align-items:center; gap:0.7rem; padding:0.8rem 1rem; background:none; border:none; cursor:pointer; font-size:0.8rem; font-weight:600; border-bottom:1px solid #f8fafc;">Take Picture</button>
            <button class="pin-option" data-type="gallery" style="width:100%; display:flex; align-items:center; gap:0.7rem; padding:0.8rem 1rem; background:none; border:none; cursor:pointer; font-size:0.8rem; font-weight:600; border-bottom:1px solid #f8fafc;">Upload Gallery</button>
            <button class="pin-option" data-type="files" style="width:100%; display:flex; align-items:center; gap:0.7rem; padding:0.8rem 1rem; background:none; border:none; cursor:pointer; font-size:0.8rem; font-weight:600;">Upload Files</button>
          </div>

          <button id="pin-btn" style="background:none; border:none; cursor:pointer; color:var(--text-muted); display:flex; flex-shrink:0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>

          <input id="chat-input" type="text" placeholder="Ask about your health..." style="flex:1; border:none; outline:none; font-size:0.82rem; color:var(--text-main); background:transparent; min-width:0;" />
          <button id="send-btn" style="width:40px; height:40px; background:var(--primary); border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,82,204,0.35); flex-shrink:0;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `;

    parent.querySelector('#chat-back').addEventListener('click', onBack);
    const input = parent.querySelector('#chat-input');
    parent.querySelector('#send-btn').addEventListener('click', () => sendMessage(input.value));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(input.value); });
    parent.querySelectorAll('.quick-chip').forEach(btn => {
      btn.addEventListener('click', () => sendMessage(btn.dataset.label));
    });

    const pinBtn = parent.querySelector('#pin-btn');
    const pinMenu = parent.querySelector('#pin-menu');
    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pinMenu.style.display = pinMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Delegated listener for report selection
    parent.addEventListener('click', e => {
      const btn = e.target.closest('.report-select-btn');
      if (btn) {
        handleReportSelection(btn.dataset.id, btn.dataset.label);
      }
    });

    document.addEventListener('click', () => { if (pinMenu) pinMenu.style.display = 'none'; });
    pinMenu.addEventListener('click', e => e.stopPropagation());

    parent.querySelectorAll('.pin-option').forEach(btn => {
      btn.addEventListener('click', () => {
        pinMenu.style.display = 'none';
        const fi = document.createElement('input');
        fi.type = 'file';
        fi.style.display = 'none';
        document.body.appendChild(fi);
        fi.onchange = async () => {
          const file = fi.files?.[0];
          fi.remove();
          if (file) setAttachment(file);
        };
        fi.click();
      });
    });

    if (autoOpenPin) {
      setTimeout(() => { pinMenu.style.display = 'block'; }, 150);
    }
    scrollToBottom();
  }

  render();
};
