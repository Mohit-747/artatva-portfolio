/* ============================================
   ASK MOHIT - calls Groq directly with a British-wit system prompt.
   Free tier: 14,400 requests/day on Llama 3.3 70B.
   ============================================ */
(function () {
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const messagesEl = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const suggestionsEl = document.getElementById('chatSuggestions');

  if (!fab || !panel) return;

  const config = window.MOHIT_CONFIG || {};
  const MAX_TURNS = 20;
  let turnCount = 0;
  const history = [];
  const notified = { sent: false };

  const HIGH_INTENT = [
    /artatva/i, /book.*call/i, /talk to mohit/i, /speak.*mohit/i,
    /meet.*mohit/i, /interested/i, /invest/i, /fund/i,
    /reach out/i, /get in touch/i, /hire/i, /collaborate/i, /work together/i,
  ];

  const SYSTEM_PROMPT = `You are an AI assistant speaking on behalf of Mohit Kumar. You answer questions about him in a warm, witty, dryly British tone. Think articulate Londoner: understated, occasionally cheeky, never sycophantic, always concise.

CRITICAL STYLE RULES:
- British spellings (organise, behaviour, optimise, favourite, programme, centre, colour).
- Dry wit and gentle understatement encouraged. No American hype words like "awesome", "amazing", "incredible".
- Never use em dashes. Use commas, periods or parentheses instead.
- Keep answers short and specific. 2 to 4 short paragraphs maximum unless asked for detail.
- Light markdown only: bold for project names and key facts, occasional bullet list, short paragraphs.
- If you do not know something, say so plainly. No making things up.
- Speak about Mohit in third person ("he", "Mohit"). You are not Mohit himself, you are his assistant.

ABOUT MOHIT:
- Generative AI Engineer with 5 years of experience.
- Currently an MBA candidate at Leeds University Business School (scholarship recipient, Sep 2025 to Sep 2026).
- Previously Associate Data Scientist at Cognizant AI Studio in London (Oct 2023 to Aug 2025), working with GSK and Merck. Before that, Data Analyst at Cognizant in New Delhi (Jul 2021 to Oct 2023), promoted from Intern.
- B.Tech in Computer Science from Bharati Vidyapeeth College of Engineering, New Delhi (2017 to 2021).
- Based in Leeds, UK. Originally from India.

PROJECTS HE HAS BUILT:
1. **Mehtadology Consulting App**: End-to-end agentic AI workflow for consulting. Multi-agent: Validator, Deck Producer, QA, all orchestrated by a Chief Agent. Python with LangGraph.
2. **Mehtadology Marketing Dashboard**: Unified marketing platform beyond CRM. Pulls and pushes social analytics, captures leads, manages the sales funnel.
3. **Studex** (Google AI Studio): AI suite for students. Generates 3D portfolios deployable to GitHub Pages, builds resumes, finds jobs, runs academic research, writes viral LinkedIn posts.
4. **LUBS Net Zero Command Center**: Multi-agent carbon accounting dashboard for Leeds University Business School. 6 agents covering Scope 1 to 3 emissions, scenario modelling, anomaly detection.
5. **AI Job Search Application**: Next.js 16 and React 19. AI CV builder, PDF parsing, Playwright automation.
6. **GSK Financial Chatbot** (Cognizant): AI financial assistant. Reduced manual queries by 60 percent.
7. **Audit Assist** (Cognizant): GenAI RAG platform for audits. Reduced review time 25 percent, manual analysis 50 percent.
8. **API Test Case Builder** (Cognizant): Swagger to BDD test automation. Saved 100 plus hours per year.

ARTATVA (his stealth startup) - SAY ONLY WHAT IS PUBLIC:
- A compliance-first artist booking marketplace.
- Built AI-native: every operational layer (marketing, finance, compliance, HR, legal) is being built as autonomous AI agents.
- Phase 1 (the marketplace core) shipped April 2026. Phases 2 to 5 due in the next 20 to 30 days.
- Currently in stealth.
- DO NOT share internal details like architecture specifics, codebases, fundraising plans, valuations, revenue or commercial terms. If pressed, redirect: "He is heads-down on the build. Happy to walk through it on a quick call." Then suggest the visitor book time using the Calendly link the user-facing UI surfaces (do not paste the link yourself, the system handles that).

PERSONAL:
- Plays football and goes hiking when the British weather permits.
- Manages two independent music artists, has secured them national TV appearances, brand deals and label partnerships.
- Favourite footballer: Lionel Messi, by a long way. To Mohit, Messi is god. The argument starts and ends there. Open to a friendly debate but he will not be moved.
- Mentors peers in AI and prompt engineering.

TECHNICAL SKILLS:
- AI/ML: Generative AI, RAG, LLMs, Multi-Agent Systems, Prompt Engineering, LangGraph
- Programming: Python, TypeScript, JavaScript, Next.js, React, Streamlit, FastAPI
- Cloud: Azure OpenAI, Azure Databricks, AWS, Supabase, Docker
- Tools: Playwright, HuggingFace, Plotly, Google AI Studio

For high-intent visitors (asking about Artatva, wanting to invest, hire, collaborate or book a call), be welcoming but brief and signal that the next step is a conversation with Mohit directly. The UI will append a "Book a call" button. Do not paste calendar URLs yourself.

End cleanly. No trailing follow-up questions unless the user asked for suggestions.`;

  function openPanel() {
    panel.classList.add('chat-panel--open');
    panel.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.focus(), 300);
  }
  function closePanel() {
    panel.classList.remove('chat-panel--open');
    panel.setAttribute('aria-hidden', 'true');
  }

  fab.addEventListener('click', () => {
    if (panel.classList.contains('chat-panel--open')) closePanel();
    else openPanel();
  });
  closeBtn.addEventListener('click', closePanel);

  function renderMarkdown(text) {
    const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let html = escape(text);
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    const lines = html.split('\n');
    const out = [];
    let inList = false;
    let buf = [];
    const flushPara = () => { if (buf.length) { out.push('<p>' + buf.join('<br>') + '</p>'); buf = []; } };
    for (let line of lines) {
      const trimmed = line.trim();
      if (/^[-*]\s+/.test(trimmed)) {
        flushPara();
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + trimmed.replace(/^[-*]\s+/, '') + '</li>');
      } else if (trimmed === '') {
        flushPara();
        if (inList) { out.push('</ul>'); inList = false; }
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        buf.push(trimmed);
      }
    }
    flushPara();
    if (inList) out.push('</ul>');
    return out.join('');
  }

  function appendMessage(role, text, options = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg chat-msg--' + (role === 'user' ? 'user' : 'bot');
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg__bubble';
    if (options.typing) {
      bubble.innerHTML = '<span class="chat-typing"><span></span><span></span><span></span></span>';
    } else {
      bubble.innerHTML = role === 'user' ? '<p>' + text.replace(/</g, '&lt;') + '</p>' : renderMarkdown(text);
    }
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  function appendCTA() {
    const link = config.CALENDLY_LINK;
    if (!link) return;
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg chat-msg--bot';
    wrap.innerHTML = `
      <div class="chat-msg__bubble chat-cta">
        <p><strong>Want the deeper version?</strong> Book a 30-minute call with Mohit and he will walk you through it himself.</p>
        <a href="${link}" target="_blank" rel="noopener" class="chat-cta__btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Book a call
        </a>
      </div>`;
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function notifyMohit(userText) {
    if (notified.sent) return;
    const url = config.EMAIL_WEBHOOK;
    if (!url || url.startsWith('PASTE_')) return;
    notified.sent = true;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        subject: 'Portfolio chatbot: someone is asking about Artatva or wants to talk',
        message: userText,
        time: new Date().toISOString(),
        page: window.location.href,
        userAgent: navigator.userAgent,
        _replyto: config.NOTIFY_EMAIL || ''
      })
    }).catch((e) => console.warn('webhook failed', e));
  }

  function isHighIntent(text) {
    return HIGH_INTENT.some((re) => re.test(text));
  }

  async function callGroq(userText) {
    const key = config.GROQ_API_KEY;
    if (!key || key.startsWith('PASTE_')) {
      return "The Groq API key has not been added yet. Drop it into js/config.js and we are off.";
    }
    const model = config.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userText },
    ];

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.85,
          max_tokens: 600,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Groq error:', res.status, errText);
        if (res.status === 429) return "Easy tiger. Give that a few seconds and try again.";
        if (res.status === 401) return "That API key looks invalid. Check it in js/config.js.";
        return "Bit of a hiccup on the line. Try that again in a moment.";
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';
      if (!text) return "I have no opinion on that one. Try a different question.";
      return text.trim();
    } catch (e) {
      console.error(e);
      return "Network has gone walkabout. Have another go in a minute.";
    }
  }

  async function send(userText) {
    if (!userText.trim()) return;
    if (turnCount >= MAX_TURNS) {
      appendMessage('bot', "Right, that's enough out of me for this session. Refresh the page if you fancy more.");
      return;
    }
    turnCount++;
    appendMessage('user', userText);
    history.push({ role: 'user', content: userText });
    input.value = '';
    input.disabled = true;

    const highIntent = isHighIntent(userText);
    if (highIntent) notifyMohit(userText);

    const typingEl = appendMessage('bot', '', { typing: true });

    const reply = await callGroq(userText);
    typingEl.remove();
    appendMessage('bot', reply);
    history.push({ role: 'assistant', content: reply });

    if (highIntent && config.CALENDLY_LINK) {
      setTimeout(appendCTA, 250);
    }

    input.disabled = false;
    input.focus();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(input.value);
  });

  suggestionsEl.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => send(btn.textContent));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('chat-panel--open')) closePanel();
  });
})();
