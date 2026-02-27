export const AiChat = (parent, { onBack, user }) => {
  const API_BASE = 'http://localhost:3001';

  // Conversation history sent to Groq (only role+content)
  const history = [];

  // Display messages (include time for UI)
  const displayMsgs = [
    {
      role: 'bot',
      text: `Hello${user?.name ? ' ' + user.name.split(' ')[0] : ''}! 👋 I'm **MediBot**, your personal health assistant.\n\nI can help you understand your reports, medications, lab values, or anything health-related. What's on your mind today?`,
      time: formatTime(new Date()),
    },
  ];

  const quickChips = [
    { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`, label: 'Explain my reports' },
    { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`, label: 'Diet advice' },
    { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`, label: 'My medications' },
    { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label: 'Health tips' },
  ];

  let isTyping = false;

  function formatTime(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Convert **bold**, bullet points, blank lines → HTML
  function parseMd(text) {
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

  function renderMessages(streamIdx = null) {
    return displayMsgs.map((m, idx) => m.role === 'bot'
      ? `<div style="display:flex; gap:0.7rem; align-items:flex-end; margin-bottom:1rem;">
           ${botAvatar}
           <div style="max-width:72%;">
             <p style="font-size:0.62rem; color:var(--text-muted); margin-bottom:3px;">MediBot</p>
             <div style="background:white; border-radius:4px 18px 18px 18px; padding:0.75rem 1rem;
                         box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f1f5f9;">
               <p style="font-size:0.84rem; color:var(--text-main); line-height:1.55;">${parseMd(m.text)}</p>
             </div>
             <p style="font-size:0.6rem; color:var(--text-muted); margin-top:3px;">${m.time}</p>
           </div>
         </div>`
      : `<div style="display:flex; gap:0.7rem; align-items:flex-end; flex-direction:row-reverse; margin-bottom:1rem;">
           ${userAvatar}
           <div style="max-width:72%;">
             <p style="font-size:0.62rem; color:var(--text-muted); margin-bottom:3px; text-align:right;">You</p>
             <div style="background:var(--primary); border-radius:18px 4px 18px 18px; padding:0.75rem 1rem;">
               <p style="font-size:0.84rem; color:white; line-height:1.55;">${parseMd(m.text)}</p>
             </div>
             <p style="font-size:0.6rem; color:var(--text-muted); margin-top:3px; text-align:right;">${m.time}</p>
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

  function refreshMessages(showTyping = false, streamIdx = null) {
    const el = parent.querySelector('#chat-messages');
    if (!el) return;
    el.innerHTML = renderMessages(streamIdx) + (showTyping ? typingIndicator : '');
    scrollToBottom();
  }

  // Fast typewriter: streams fullReply into the last bot bubble char-by-char
  function typeWriter(fullReply, onDone) {
    const SPEED = 12; // ms per character — lower = faster
    let i = 0;
    // Push a placeholder bot message that will grow
    const msgIdx = displayMsgs.length;
    displayMsgs.push({ role: 'bot', text: '', time: formatTime(new Date()) });

    function tick() {
      i++;
      displayMsgs[msgIdx].text = fullReply.slice(0, i);
      refreshMessages(false, msgIdx); // re-render with live text
      if (i < fullReply.length) {
        setTimeout(tick, SPEED);
      } else {
        onDone();
      }
    }
    tick();
  }

  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;
    const input = parent.querySelector('#chat-input');
    if (input) input.value = '';

    history.push({ role: 'user', content: text.trim() });
    displayMsgs.push({ role: 'user', text: text.trim(), time: formatTime(new Date()) });
    isTyping = true;
    refreshMessages(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || 'Sorry, something went wrong.';
      history.push({ role: 'assistant', content: reply });

      // Hide typing dots, then typewrite the response
      refreshMessages(false);
      typeWriter(reply, () => { isTyping = false; });

    } catch (err) {
      displayMsgs.push({ role: 'bot', text: 'Network error. Please check your connection.', time: formatTime(new Date()) });
      isTyping = false;
      refreshMessages(false);
    }
  }

  function render() {
    parent.innerHTML = `
      <div style="height:100%; display:flex; flex-direction:column; background:#f8fafc;">

        <!-- Header -->
        <div style="background:white; padding:1.2rem 1.2rem 0.9rem; display:flex; align-items:center; gap:1rem;
                    border-bottom:1px solid #f1f5f9; box-shadow:0 2px 10px rgba(0,0,0,0.04); flex-shrink:0;">
          <button id="chat-back" style="background:none; border:none; cursor:pointer; padding:0.2rem; color:var(--text-main); display:flex;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div style="flex:1; text-align:center;">
            <p style="font-weight:800; font-size:0.97rem; color:var(--text-main);">Medical Assistant</p>
            <div style="display:flex; align-items:center; justify-content:center; gap:4px; margin-top:2px;">
              <div style="width:7px; height:7px; background:#22c55e; border-radius:50%;"></div>
              <p style="font-size:0.7rem; color:#22c55e; font-weight:600;">AI is online</p>
            </div>
          </div>
          <button style="background:none; border:none; cursor:pointer; padding:0.2rem; color:var(--text-muted); display:flex;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>

        <!-- Date label -->
        <div style="text-align:center; padding:0.7rem; flex-shrink:0;">
          <span style="font-size:0.67rem; color:var(--text-muted); background:#e2e8f0; padding:0.22rem 0.7rem; border-radius:50px;">
            TODAY, ${formatTime(new Date())}
          </span>
        </div>

        <!-- Messages -->
        <div id="chat-messages" style="flex:1; overflow-y:auto; padding:0.5rem 1.2rem; scrollbar-width:none;">
          ${renderMessages()}
        </div>

        <!-- Quick chips -->
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

        <!-- Input row -->
        <div style="background:white; border-top:1px solid #f1f5f9; padding:0.75rem 1rem; display:flex; gap:0.6rem; align-items:center; flex-shrink:0;">
          <button style="background:none; border:none; cursor:pointer; color:var(--text-muted); display:flex; flex-shrink:0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <input id="chat-input" type="text" placeholder="Ask about your health..."
                 style="flex:1; border:none; outline:none; font-size:0.84rem; font-family:'Poppins',sans-serif; color:var(--text-main); background:transparent; min-width:0;" />
          <button style="background:none; border:none; cursor:pointer; color:var(--text-muted); display:flex; flex-shrink:0;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
          <button id="send-btn"
                  style="width:40px; height:40px; background:var(--primary); border:none; border-radius:50%; cursor:pointer;
                         display:flex; align-items:center; justify-content:center;
                         box-shadow:0 4px 14px rgba(0,82,204,0.35); flex-shrink:0;">
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

    scrollToBottom();
  }

  render();
};
