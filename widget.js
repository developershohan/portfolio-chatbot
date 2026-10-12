// Shohan Jr, the AI assistant for proshohan.com. Add this one line before </body>:
// <script src="https://portfolio-chatbot-9lli.onrender.com/widget.js" defer></script>
(() => {
  const API = new URL(document.currentScript.src).origin;
  const AVATAR = "https://proshohan.com/wp-content/uploads/2025/10/Generated-Image-October-03-2025-6_43PM.png";
  const SERVICES = ["Custom WordPress theme", "Custom plugin or widget", "WooCommerce / e-commerce",
    "WordPress debugging", "React / headless WordPress", "API integration", "Something else"];
  const FALLBACK = "Sorry, I couldn't answer right now. Please email dev.shohanur@gmail.com or call +880 1580-334007.";
  const history = []; // the conversation so far, sent with every question so follow-ups work
  fetch(API, { mode: "no-cors" }).catch(() => {}); // wake the free server while the visitor reads the page

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
      if (data.book) showForm();
    } catch {
      write(reply, FALLBACK);
    }
    log.scrollTop = log.scrollHeight;
  }

  function showForm() {
    if ($("lead")) return $("lead").scrollIntoView({ behavior: "smooth" });
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
        say(`✅ Thanks ${lead.name}! Your request is saved. Shohan will email you to confirm the appointment.`, "bot");
      } catch {
        form.querySelector(".go").disabled = false;
        say("Sorry, that didn't go through. Please check the form or email dev.shohanur@gmail.com.", "bot");
      }
    };
    log.append(form);
    log.scrollTop = log.scrollHeight;
    form.querySelector("input").focus();
  }

  const setOpen = (open) => {
    box.classList.toggle("open", open);
    $("open").classList.toggle("on", open);
    $("open").setAttribute("aria-expanded", open);
    $("open").setAttribute("aria-label", open ? "Close chat" : "Chat with Shohan Jr");
    $("nudge").hidden = true;
    if (open) q.focus();
  };
  $("open").onclick = () => setOpen(!box.classList.contains("open"));
  $("close").onclick = () => setOpen(false);
  $("nudge").onclick = () => setOpen(true);
  root.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  $("chips").onclick = (e) => {
    const chip = e.target.closest("button");
    if (chip) chip.dataset.q ? send(chip.dataset.q) : showForm();
  };
  $("ask").onsubmit = (e) => {
    e.preventDefault();
    const message = q.value.trim();
    q.value = "";
    if (message) send(message);
  };

  // a friendly nudge once per visit, after a few seconds
  let nudged = false;
  try { nudged = sessionStorage.getItem("shohanjr-nudged"); sessionStorage.setItem("shohanjr-nudged", "1"); } catch {}
  if (!nudged) {
    setTimeout(() => { if (!box.classList.contains("open")) $("nudge").hidden = false; }, 4000);
    setTimeout(() => { $("nudge").hidden = true; }, 16000);
  }
})();
