// Shohan Jr, the AI assistant for proshohan.com. Paste the loader snippet from the README before </body>.
// It fetches this file only after the page has loaded, so the chat can never slow down the site.
(() => {
  if (window.shohanJr) return; // already on the page (snippet added twice, or re-run by a cache plugin)
  window.shohanJr = true;
  // currentScript is null when an optimisation plugin (NitroPack, WP Rocket...) runs the script itself
  const API = document.currentScript?.src ? new URL(document.currentScript.src).origin : "https://chat.srv1836598.hstgr.cloud";
  const AVATAR = "https://proshohan.com/wp-content/uploads/2025/10/Generated-Image-October-03-2025-6_43PM.png";
  const SERVICES = ["Custom WordPress theme", "Custom plugin or widget", "WooCommerce / e-commerce",
    "WordPress debugging", "React / headless WordPress", "API integration", "Something else"];
  const FALLBACK = "Sorry, I couldn't answer right now. Please email dev.shohanur@gmail.com or call +880 1580-334007.";
  const history = []; // the conversation so far, sent with every question so follow-ups work

  // Shadow DOM: the widget gets its own little page, so the theme's CSS can't break it (and it can't break the theme)
  const host = document.createElement("div");
  document.body.append(host);
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>
    :host{all:initial;--lime:#c9f31d;--bg:#121212;--card:#1c1c1c;--line:rgba(255,255,255,.1);--text:#ececec;--muted:#9a9a9a;--body:Kanit,system-ui,sans-serif;--head:Teko,Oswald,Impact,sans-serif}
    *{box-sizing:border-box}
    [hidden]{display:none!important}
    button{font-family:var(--body);cursor:pointer}
    :focus-visible{outline:2px solid var(--lime);outline-offset:2px}
    #box{position:fixed;right:24px;bottom:100px;width:380px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 124px);display:flex;flex-direction:column;background:var(--bg);color:var(--text);font:15px/1.5 var(--body);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.45);z-index:2147483000;opacity:0;visibility:hidden;transform:translateY(16px) scale(.98);transition:opacity .2s,transform .2s,visibility 0s .2s}
    #box.open{opacity:1;visibility:visible;transform:none;transition-delay:0s}
    header{display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(135deg,#1d1d1d,#0b0b0b);border-bottom:1px solid var(--line)}
    .av{position:relative;flex:none}
    .av img{display:block;width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:50% 12%;background:#fff;border:2px solid var(--lime)}
    .av::after{content:"";position:absolute;right:0;bottom:2px;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2px solid #121212}
    .name{font:600 26px/1 var(--head);letter-spacing:.04em;text-transform:uppercase;color:#fff}
    .sub{font-size:12px;color:var(--muted)}
    #close{margin-left:auto;width:34px;height:34px;border:1px solid var(--line);border-radius:50%;background:none;color:#fff;font-size:20px;line-height:1}
    #close:hover{border-color:var(--lime);color:var(--lime)}
    #tabs{display:flex;background:#0f0f0f;border-bottom:1px solid var(--line)}
    #tabs button{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 0;background:none;border:0;border-bottom:2px solid transparent;color:var(--muted);font-size:14px}
    #tabs button:hover{color:#fff}
    #tabs button[aria-selected=true]{color:#fff;border-bottom-color:var(--lime)}
    #chatpane{flex:1;min-height:0;display:flex;flex-direction:column}
    #voicepane{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:22px 26px;text-align:center}
    #orb{position:relative;width:128px;height:128px;margin-bottom:6px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 50% 35%,#262626,#141414);border:1px solid var(--line);color:var(--lime)}
    #orb img{display:none;width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:50% 12%;background:#fff}
    #orb::before{content:"";position:absolute;inset:-9px;border-radius:50%;border:2px solid var(--lime);opacity:0;transform:scale(calc(1 + var(--lvl,0) * .3));transition:transform .08s linear,opacity .3s}
    .call #orb img{display:block}.call #orb svg{display:none}.call #orb::before{opacity:.9}
    #voicepane h3{margin:0;font:600 30px/1 var(--head);text-transform:uppercase;letter-spacing:.03em;color:#fff}
    #voicepane h3 em{font:italic 700 24px "Playfair Display",Georgia,serif;text-transform:none;letter-spacing:0;color:var(--lime)}
    #vtext{margin:0;max-width:290px;font-size:14px;color:var(--muted)}
    .call #vtext{display:none}
    #vstatus{min-height:20px;font-size:13px;color:var(--lime);font-variant-numeric:tabular-nums}
    #caption{min-height:44px;max-width:300px;font-size:15px;color:var(--text)}
    #call{border:0;border-radius:999px;padding:13px 36px;background:var(--lime);color:#0b0b0b;font-size:16px;font-weight:600}
    #call.end{background:#ff3d00;color:#fff}
    #call:disabled{opacity:.6;cursor:wait}
    .person{font-size:13px;color:var(--muted)}
    .person a{color:var(--lime);text-decoration:none}
    #log{flex:1;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:#333 transparent}
    .hero h2{margin:0 0 6px;font:600 32px/1 var(--head);text-transform:uppercase;letter-spacing:.02em;color:#fff}
    .hero em{font:italic 700 26px "Playfair Display",Georgia,serif;text-transform:none;letter-spacing:0;color:var(--lime)}
    .hero p{margin:0 0 4px;font-size:14px;color:var(--muted)}
    .msg{max-width:86%;padding:10px 14px;border-radius:16px;white-space:pre-wrap;overflow-wrap:anywhere;animation:up .25s ease}
    .bot{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:4px}
    .bot a{color:var(--lime)}
    .me{align-self:flex-end;background:var(--lime);color:#0b0b0b;border-bottom-right-radius:4px}
    .dots{display:inline-flex;gap:4px;padding:4px 0}
    .dots i{width:7px;height:7px;border-radius:50%;background:var(--muted);animation:bounce 1s infinite}
    .dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}
    #chips{display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px 0;border-top:1px solid var(--line)}
    #chips button{border:1px solid var(--line);background:none;color:var(--text);border-radius:999px;padding:6px 13px;font-size:13px;transition:border-color .15s,color .15s}
    #chips button:hover{border-color:var(--lime);color:var(--lime)}
    #chips .hot{background:var(--lime);border-color:var(--lime);color:#0b0b0b;font-weight:500}
    #chips .hot:hover{color:#0b0b0b;filter:brightness(1.08)}
    #ask{display:flex;gap:8px;padding:10px 14px 6px}
    #q{flex:1;min-width:0;background:#1a1a1a;border:1px solid var(--line);border-radius:999px;padding:11px 16px;color:#fff;font:15px var(--body);outline:none}
    #q:focus{border-color:var(--lime)}
    #q::placeholder{color:#777}
    .round{flex:none;width:44px;height:44px;border:0;border-radius:50%;background:var(--lime);color:#0b0b0b;display:grid;place-items:center}
    .note{padding:0 14px 10px;font-size:11px;letter-spacing:.04em;color:#6b6b6b;text-align:center}
    .note a{color:var(--lime);text-decoration:none;font-weight:500}
    .note a:hover{text-decoration:underline}
    #lead{align-self:stretch;display:flex;flex-direction:column;gap:10px;padding:16px;background:var(--card);border:1px solid var(--line);border-radius:16px;animation:up .25s ease}
    #lead h3{margin:0;font:600 26px/1 var(--head);text-transform:uppercase;letter-spacing:.03em;color:#fff}
    #lead h3 em{font:italic 700 20px "Playfair Display",Georgia,serif;text-transform:none;color:var(--lime)}
    #lead label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--muted)}
    #lead input,#lead select,#lead textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:10px 12px;color:#fff;font:14px var(--body);outline:none;color-scheme:dark}
    #lead input:focus,#lead select:focus,#lead textarea:focus{border-color:var(--lime)}
    #lead .go{border:0;border-radius:999px;padding:12px;background:var(--lime);color:#0b0b0b;font-size:15px;font-weight:600}
    #lead .go:disabled{opacity:.6}
    #open{position:fixed;right:24px;bottom:24px;width:62px;height:62px;border:0;border-radius:50%;background:var(--lime);color:#0b0b0b;display:grid;place-items:center;box-shadow:0 10px 30px rgba(201,243,29,.35);z-index:2147483000;transition:transform .2s}
    #open:hover{transform:scale(1.06)}
    #open .x,#open.on .chat{display:none}
    #open.on .x{display:block}
    #nudge{position:fixed;right:98px;bottom:34px;max-width:230px;padding:10px 14px;background:var(--bg);color:#fff;font:14px/1.4 var(--body);border:1px solid var(--lime);border-radius:14px 14px 4px 14px;box-shadow:0 10px 30px rgba(0,0,0,.3);cursor:pointer;z-index:2147483000;animation:up .3s ease}
    #nudge b{color:var(--lime);font-weight:500}
    @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    @keyframes bounce{0%,80%,100%{opacity:.35;transform:none}40%{opacity:1;transform:translateY(-3px)}}
    @media (max-width:480px){#box{inset:0;width:100%;max-width:none;height:100%;max-height:none;border:0;border-radius:0}#box.open~#open,#nudge{display:none}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
  </style>
  <div id="box" role="dialog" aria-label="Chat with Shohan Jr">
    <header>
      <div class="av"><img src="${AVATAR}" alt=""></div>
      <div><div class="name">Shohan Jr</div><div class="sub">Shohan's AI assistant · Online</div></div>
      <button id="close" aria-label="Close chat">×</button>
    </header>
    <div id="tabs" role="tablist">
      <button type="button" role="tab" id="tab-chat" data-tab="chat" aria-selected="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z"/></svg>Chat</button>
      <button type="button" role="tab" id="tab-voice" data-tab="voice" aria-selected="false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>Voice</button>
    </div>
    <div id="voicepane" role="tabpanel" aria-labelledby="tab-voice" hidden>
      <div id="orb"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2zM3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z"/></svg><img src="${AVATAR}" alt=""></div>
      <h3>Talk to <em>Shohan Jr</em></h3>
      <p id="vtext">Speak in English or Bangla. Shohan Jr answers from Shohan's own information and can book your call. Your browser will ask for the microphone.</p>
      <div id="vstatus" aria-live="polite"></div>
      <div id="caption"></div>
      <button type="button" id="call">Start call</button>
      <div class="person">Prefer a person? Call <a href="tel:+8801580334007">01580 334007</a></div>
    </div>
    <div id="chatpane" role="tabpanel" aria-labelledby="tab-chat">
    <div id="log" aria-live="polite">
      <div class="hero"><h2>Hey, I'm <em>Shohan Jr</em></h2>
        <p>Ask me about Shohan's skills, projects and services, or book a call in seconds.</p></div>
    </div>
    <div id="chips">
      <button type="button" data-q="What services does Shohan offer?">Services</button>
      <button type="button" data-q="Show me Shohan's best projects">Projects</button>
      <button type="button" data-q="How can I contact Shohan?">Contact</button>
      <button type="button" class="hot" data-book>Book a call</button>
    </div>
    <form id="ask">
      <input id="q" aria-label="Your question" placeholder="Ask Shohan Jr anything…" maxlength="500" autocomplete="off" required>
      <button class="round" aria-label="Send"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </form>
    </div>
    <div class="note">Designed &amp; built by <a href="https://proshohan.com" target="_blank" rel="noopener">Developer Shohan</a></div>
  </div>
  <div id="nudge" hidden>👋 Hi! I'm <b>Shohan Jr</b>. Need a website? Ask me anything.</div>
  <button id="open" aria-label="Chat with Shohan Jr" aria-expanded="false">
    <svg class="chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" stroke-width="3"/></svg>
    <svg class="x" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
  </button>`;

  const $ = (id) => root.getElementById(id);
  const box = $("box"), log = $("log"), q = $("q");

  // show text, turning links, emails and phone numbers into tappable links (never innerHTML with AI text)
  const LINK = /(https?:\/\/[^\s)]*[^\s).,!?]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|(?:\+|\b0)\d[\d\s‐-―-]{7,}\d)/g; // ‐-―: the fancy dashes AI writes in phone numbers
  const write = (el, text) => {
    el.textContent = "";
    text.split(LINK).forEach((part, i) => {
      if (i % 2 === 0) return part && el.append(part);
      const a = document.createElement("a");
      a.textContent = part;
      a.href = part.startsWith("http") ? part : part.includes("@") ? `mailto:${part}` : `tel:${part.replace(/[^\d+]/g, "")}`;
      if (part.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; }
      el.append(a);
    });
  };
  const say = (text, who) => {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    who === "bot" ? write(div, text) : (div.textContent = text);
    log.append(div);
    log.scrollTop = log.scrollHeight;
    return div;
  };
  const post = (path, data) => fetch(API + path, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  }).then((res) => { if (!res.ok) throw new Error(res.status); return res.json(); });

  async function send(message) {
    say(message, "me");
    const reply = say("", "bot");
    reply.innerHTML = '<span class="dots" aria-label="Shohan Jr is typing"><i></i><i></i><i></i></span>';
    try {
      const data = await post("/chat", { message, history: history.slice(-10) });
      write(reply, data.reply);
      history.push({ role: "user", content: message }, { role: "assistant", content: data.reply.slice(0, 2000) });
      if (data.book) showForm(data.prefill);
      save();
    } catch {
      write(reply, FALLBACK);
    }
    // show the new reply from its first line, with the form (if any) right under it
    log.scrollTop += reply.getBoundingClientRect().top - log.getBoundingClientRect().top - 12;
  }

  function showForm(prefill = {}, focus = true) {
    const form = $("lead") || makeForm();
    for (const [name, value] of Object.entries(prefill)) { // details the visitor already gave in the chat
      if (form.elements[name] && !form.elements[name].value) form.elements[name].value = value;
    }
    log.append(form); // already open? move it under the latest reply, keeping what they typed
    if (!focus) return;
    log.scrollTop += form.getBoundingClientRect().top - log.getBoundingClientRect().top - 12;
    [...form.elements].find((el) => el.required && !el.value)?.focus({ preventScroll: true });
  }

  function makeForm() {
    const form = document.createElement("form");
    form.id = "lead";
    form.innerHTML = `
      <h3>Book a <em>call</em></h3>
      <label>Your name *<input name="name" required maxlength="100" autocomplete="name"></label>
      <label>Email *<input name="email" type="email" required maxlength="200" autocomplete="email"></label>
      <label>Phone / WhatsApp<input name="phone" type="tel" maxlength="40" autocomplete="tel"></label>
      <label>What do you need? *<select name="service" required><option value="">Choose…</option>${SERVICES.map((s) => `<option>${s}</option>`).join("")}</select></label>
      <label>Preferred date &amp; time *<input name="preferred_time" type="datetime-local" required></label>
      <label>Project details<textarea name="details" rows="3" maxlength="1000"></textarea></label>
      <button class="go">Request appointment</button>`;
    const now = new Date();
    form.elements.preferred_time.min = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const lead = Object.fromEntries(new FormData(form));
      lead.preferred_time = `${lead.preferred_time.replace("T", " ")} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
      form.querySelector(".go").disabled = true;
      try {
        await post("/lead", lead);
        form.remove();
        const thanks = `✅ Thanks ${lead.name}! Your request is saved. Shohan will email you to confirm the appointment.`;
        say(thanks, "bot");
        history.push({ role: "assistant", content: thanks });
        save();
      } catch {
        form.querySelector(".go").disabled = false;
        say("Sorry, that didn't go through. Please check the form or email dev.shohanur@gmail.com.", "bot");
      }
    };
    return form;
  }

  const setOpen = (open) => {
    box.classList.toggle("open", open);
    $("open").classList.toggle("on", open);
    $("open").setAttribute("aria-expanded", open);
    $("open").setAttribute("aria-label", open ? "Close chat" : "Chat with Shohan Jr");
    $("nudge").hidden = true;
    if (open) q.focus();
    else if (call) hangUp("Call ended.");
  };
  $("open").onclick = () => setOpen(!box.classList.contains("open"));
  $("close").onclick = () => setOpen(false);
  $("nudge").onclick = () => setOpen(true);
  root.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  $("chips").onclick = (e) => {
    const chip = e.target.closest("button");
    if (!chip) return;
    if (chip.dataset.q) return send(chip.dataset.q);
    showForm();
    save();
  };
  $("ask").onsubmit = (e) => {
    e.preventDefault();
    const message = q.value.trim();
    q.value = "";
    if (message) send(message);
  };

  // TABS: Chat and Voice share one conversation
  const showTab = (tab) => {
    $("chatpane").hidden = tab !== "chat";
    $("voicepane").hidden = tab !== "voice";
    $("tab-chat").setAttribute("aria-selected", tab === "chat");
    $("tab-voice").setAttribute("aria-selected", tab === "voice");
    if (tab === "chat") q.focus();
  };
  $("tabs").onclick = (e) => { const tab = e.target.closest("[data-tab]"); if (tab) showTab(tab.dataset.tab); };

  // VOICE: a live call with Google's Gemini Live. Our server only hands out a one-time token (Shohan Jr's
  // instructions, knowledge and booking tool are locked inside it); the audio goes straight to Google and back.
  const LIVE = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=";
  // two tiny audio processors: "mic" turns the microphone into 16 kHz 16-bit chunks (what Gemini wants),
  // "speaker" plays Gemini's reply smoothly as the pieces stream in
  const WORKLETS = URL.createObjectURL(new Blob([`
    registerProcessor("mic", class extends AudioWorkletProcessor {
      constructor() { super(); this.step = sampleRate / 16000; this.pos = 0; this.sum = 0; this.n = 0; this.out = new Int16Array(512); this.i = 0; }
      process([input]) {
        for (const s of input[0] || []) {
          this.sum += s; this.n++;
          if (++this.pos >= this.step) { // average the samples that make one 16 kHz sample (cheap low-pass)
            this.pos -= this.step;
            this.out[this.i++] = Math.max(-1, Math.min(1, this.sum / this.n)) * 32767;
            this.sum = this.n = 0;
            if (this.i === this.out.length) { this.port.postMessage(this.out.slice()); this.i = 0; }
          }
        }
        return true;
      }
    });
    registerProcessor("speaker", class extends AudioWorkletProcessor {
      constructor() { super(); this.queue = []; this.at = 0; this.port.onmessage = (e) => { if (e.data === "clear") { this.queue = []; this.at = 0; } else this.queue.push(e.data); }; }
      process(inputs, [output]) {
        const out = output[0];
        for (let i = 0; i < out.length; i++) {
          const chunk = this.queue[0];
          out[i] = chunk ? chunk[this.at++] : 0;
          if (chunk && this.at === chunk.length) { this.queue.shift(); this.at = 0; }
        }
        return true;
      }
    });`], { type: "text/javascript" }));
  let call = null; // the call in progress: { ws, stream, mic, out, speaker, timer, started, turn }
  const status = (text) => { $("vstatus").textContent = text; };
  const clock = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
  const toBase64 = (pcm) => btoa(String.fromCharCode(...new Uint8Array(pcm.buffer)));
  const pulse = (samples, full) => { // the ring around Shohan Jr moves with whoever is talking
    let peak = 0;
    for (let i = 0; i < samples.length; i += 16) peak = Math.max(peak, Math.abs(samples[i]));
    $("orb").style.setProperty("--lvl", Math.min(1, (peak / full) * 3).toFixed(2));
  };

  async function startCall() {
    if (document.featurePolicy?.allowsFeature("microphone") === false) { // the site's Permissions-Policy header switches the mic off
      console.warn("Shohan Jr voice: this page's Permissions-Policy header blocks the microphone. Change microphone=() to microphone=(self).");
      return status("Voice is switched off by this website's settings. Please use the chat or call 01580 334007.");
    }
    const c = call = { turn: null };
    $("call").disabled = true;
    status("Connecting…");
    // audio must be switched on inside the tap, or Safari keeps it silent
    c.mic = new AudioContext();
    c.out = new AudioContext({ sampleRate: 24000 }); // Gemini speaks at 24 kHz
    try {
      // microphone first: if the visitor says no, no call (and no free-quota token) is used up
      c.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const { token, model } = await post("/voice-token", { now: new Date().toString() });
      await Promise.all([c.mic.audioWorklet.addModule(WORKLETS), c.out.audioWorklet.addModule(WORKLETS)]);
      if (call !== c) return cleanup(c); // hung up while connecting
      c.speaker = new AudioWorkletNode(c.out, "speaker");
      c.speaker.connect(c.out.destination);
      c.ws = new WebSocket(LIVE + encodeURIComponent(token));
      c.ws.binaryType = "arraybuffer";
      c.ws.onopen = () => c.ws.send(JSON.stringify({ setup: { model } }));
      c.ws.onmessage = (e) => onLive(c, JSON.parse(typeof e.data === "string" ? e.data : new TextDecoder().decode(e.data)));
      c.ws.onclose = (e) => {
        if (call !== c) return;
        if (!c.started) console.warn("Shohan Jr voice:", e.code, e.reason);
        hangUp(c.started ? "Call ended." : "The call couldn't start. Please try again or call 01580 334007.");
      };
    } catch (err) {
      if (call !== c) return cleanup(c);
      hangUp(err?.name === "NotAllowedError" ? "Please allow the microphone to talk to Shohan Jr."
        : String(err?.message) === "429" ? "Too many calls right now. Please try again in a few minutes."
        : "The call couldn't start. Please try again or call 01580 334007.");
    }
  }

  function onLive(c, msg) {
    if (call !== c) return;
    if (msg.setupComplete) { // connected: start sending the microphone and ask Shohan Jr to say hello
      const mic = new AudioWorkletNode(c.mic, "mic");
      mic.port.onmessage = (e) => {
        if (c.ws.readyState === 1) c.ws.send(JSON.stringify({ realtimeInput: { audio: { data: toBase64(e.data), mimeType: "audio/pcm;rate=16000" } } }));
        pulse(e.data, 32768);
      };
      c.mic.createMediaStreamSource(c.stream).connect(mic).connect(c.mic.destination); // mic outputs silence, no echo
      c.ws.send(JSON.stringify({ clientContent: { turns: [{ role: "user", parts: [{ text: "[call started]" }] }], turnComplete: true } }));
      c.started = Date.now();
      c.timer = setInterval(() => status(`Live · ${clock(Date.now() - c.started)}`), 1000);
      status("Live · 0:00");
      $("voicepane").classList.add("call");
      $("call").textContent = "End call";
      $("call").classList.add("end");
      $("call").disabled = false;
    }
    const content = msg.serverContent;
    for (const part of content?.modelTurn?.parts || []) {
      if (!part.inlineData) continue;
      const bytes = Uint8Array.from(atob(part.inlineData.data), (ch) => ch.charCodeAt(0));
      const samples = Float32Array.from(new Int16Array(bytes.buffer), (v) => v / 32768);
      c.speaker.port.postMessage(samples);
      pulse(samples, 1);
    }
    if (content?.inputTranscription?.text) transcript(c, "user", content.inputTranscription.text);
    if (content?.outputTranscription?.text) transcript(c, "assistant", content.outputTranscription.text);
    if (content?.interrupted) c.speaker.port.postMessage("clear"); // the visitor talked over Shohan Jr: stop speaking
    if (content?.turnComplete) finishTurn(c);
    if (msg.toolCall) book(c, msg.toolCall.functionCalls || []);
  }

  // write both sides of the call into the chat, as it's spoken
  function transcript(c, role, text) {
    if (c.turn?.role !== role) {
      finishTurn(c);
      c.turn = { role, text: "", div: say("", role === "user" ? "me" : "bot") };
    }
    c.turn.text += text;
    c.turn.div.textContent = c.turn.text;
    if (role === "assistant") $("caption").textContent = c.turn.text.trim().slice(-160);
    log.scrollTop = log.scrollHeight;
  }
  function finishTurn(c) {
    const turn = c.turn;
    c.turn = null;
    if (!turn) return;
    const text = turn.text.trim();
    if (!text) return turn.div.remove();
    if (turn.role === "assistant") write(turn.div, text); // phone numbers and emails become tappable
    history.push({ role: turn.role, content: text.slice(0, 2000) });
    save();
  }

  // Shohan Jr collected the booking details by voice: save them like the form does (database + email)
  async function book(c, calls) {
    const functionResponses = [];
    for (const fc of calls) {
      const lead = Object.fromEntries(Object.entries(fc.args || {}).filter(([, v]) => v));
      if (lead.preferred_time) lead.preferred_time += ` (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
      let response;
      try {
        await post("/lead", lead);
        response = { result: "Saved. Shohan will email the visitor to confirm." };
        finishTurn(c);
        const done = `✅ Booking saved for ${lead.name}. Shohan will email you to confirm.`;
        say(done, "bot");
        history.push({ role: "assistant", content: done });
        save();
      } catch {
        response = { error: "Could not save. Check the email address, and that name, email, service and preferred time are all given, then try again." };
      }
      functionResponses.push({ id: fc.id, name: fc.name, response });
    }
    if (call === c && c.ws.readyState === 1) c.ws.send(JSON.stringify({ toolResponse: { functionResponses } }));
  }

  function cleanup(c) {
    clearInterval(c.timer);
    c.stream?.getTracks().forEach((t) => t.stop());
    for (const ctx of [c.mic, c.out]) if (ctx && ctx.state !== "closed") ctx.close();
    if (c.ws && c.ws.readyState < 2) c.ws.close();
  }
  function hangUp(message = "") {
    const c = call;
    call = null;
    if (c) { finishTurn(c); cleanup(c); }
    $("voicepane").classList.remove("call");
    $("orb").style.removeProperty("--lvl");
    $("call").textContent = "Start call";
    $("call").classList.remove("end");
    $("call").disabled = false;
    $("caption").textContent = "";
    status(message);
  }
  $("call").onclick = () => (call ? hangUp("Call ended.") : startCall());
  addEventListener("pagehide", () => call && hangUp()); // a call never outlives its page

  // keep the chat when the visitor opens another page or tab; forget it after a day without use
  const SAVED = "shohanjr-chat";
  function save() {
    try { localStorage.setItem(SAVED, JSON.stringify({ at: Date.now(), history: history.slice(-40), form: !!$("lead") })); } catch {}
  }
  function restore(raw) { // never calls save(): two open tabs would keep waking each other up
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved?.history) || Date.now() - saved.at > 864e5) return;
    log.querySelectorAll(".msg").forEach((m) => m.remove());
    history.splice(0, Infinity, ...saved.history);
    history.forEach((t) => say(t.content, t.role === "user" ? "me" : "bot"));
    if (saved.form) showForm({}, false);
    else $("lead")?.remove();
  }
  try { restore(localStorage.getItem(SAVED)); } catch {} // storage can be blocked (private mode) or hold junk
  addEventListener("storage", (e) => { // chatting in another tab: show those messages here too
    if (e.key === SAVED) try { restore(e.newValue); } catch {}
  });

  // a friendly nudge once per visit, after a few seconds
  let nudged = false;
  try { nudged = sessionStorage.getItem("shohanjr-nudged"); sessionStorage.setItem("shohanjr-nudged", "1"); } catch {}
  if (!nudged) {
    setTimeout(() => { if (!box.classList.contains("open")) $("nudge").hidden = false; }, 4000);
    setTimeout(() => { $("nudge").hidden = true; }, 16000);
  }
})();
