// Chat bubble for your website. Add this one line before </body>:
// <script src="https://YOUR-APP.onrender.com/widget.js" defer></script>
(() => {
  const API = new URL(document.currentScript.src).origin;
  const COLOR = "#4f46e5"; // change to your brand colour
  const SERVICES = ["Custom WordPress theme", "Custom plugin or widget", "WooCommerce / e-commerce",
    "WordPress debugging", "React / headless WordPress", "API integration", "Something else"];
  const history = []; // the conversation so far, sent with every question so follow-ups work
  fetch(API, { mode: "no-cors" }).catch(() => {}); // wake the free server while the visitor reads the page

  document.head.insertAdjacentHTML("beforeend", `<style>
    #pc-btn{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border:0;border-radius:50%;background:${COLOR};color:#fff;font-size:26px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:99999}
    #pc-box{position:fixed;right:20px;bottom:88px;width:min(370px,calc(100vw - 32px));height:min(560px,calc(100vh - 120px));display:flex;flex-direction:column;background:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.25);overflow:hidden;font:15px/1.45 system-ui,sans-serif;z-index:99999}
    #pc-box[hidden]{display:none}
    #pc-box button{text-transform:none;letter-spacing:normal}
    #pc-head{background:${COLOR};color:#fff;padding:14px 16px;font-weight:600;display:flex;justify-content:space-between;align-items:center}
    #pc-head button{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;padding:0}
    #pc-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#f6f7fb}
    .pc-msg{max-width:85%;padding:9px 13px;border-radius:12px;white-space:pre-wrap;overflow-wrap:anywhere;color:#111}
    .pc-bot{background:#fff;align-self:flex-start;border:1px solid #e5e7eb}
    .pc-me{background:${COLOR};color:#fff;align-self:flex-end}
    #pc-lead{display:flex;flex-direction:column;gap:8px;max-width:100%;width:100%;box-sizing:border-box;white-space:normal}
    #pc-lead label{display:flex;flex-direction:column;gap:3px;font-size:13px;color:#374151}
    #pc-lead input,#pc-lead select,#pc-lead textarea{font:inherit;padding:8px;border:1px solid #d1d5db;border-radius:8px;color:#111;background:#fff;width:100%;box-sizing:border-box}
    #pc-lead button{background:${COLOR};color:#fff;border:0;border-radius:8px;padding:10px;font:inherit;font-weight:600;cursor:pointer}
    #pc-lead button:disabled{opacity:.6}
    #pc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px;border-top:1px solid #e5e7eb;background:#fff}
    #pc-chips button{border:1px solid ${COLOR};color:${COLOR};background:#fff;border-radius:999px;padding:5px 11px;font:inherit;font-size:13px;cursor:pointer}
    #pc-form{display:flex;border-top:1px solid #e5e7eb}
    #pc-in{flex:1;border:0;padding:14px;font:inherit;outline:none;color:#111;background:#fff}
    #pc-form button{border:0;background:none;color:${COLOR};font:inherit;font-weight:600;padding:0 16px;cursor:pointer}
  </style>`);

  document.body.insertAdjacentHTML("beforeend", `
    <button id="pc-btn" aria-label="Open chat">💬</button>
    <div id="pc-box" role="dialog" aria-label="Chat with Shohan's assistant" hidden>
      <div id="pc-head">Ask about Shohan <button id="pc-x" aria-label="Close chat">×</button></div>
      <div id="pc-log" aria-live="polite"></div>
      <div id="pc-chips">
        <button type="button" data-q="What services does Shohan offer?">💼 Services</button>
        <button type="button" data-q="Show me some of Shohan's projects">📁 Projects</button>
        <button type="button" data-book>📅 Book appointment</button>
      </div>
      <form id="pc-form"><input id="pc-in" aria-label="Your question" placeholder="Type your question…" maxlength="500" autocomplete="off" required><button>Send</button></form>
    </div>`);

  const $ = (id) => document.getElementById(id);
  const log = $("pc-log");
  const say = (text, who) => {
    const div = document.createElement("div");
    div.className = `pc-msg pc-${who}`;
    div.textContent = text; // textContent, not innerHTML: never render AI output as HTML
    log.append(div);
    log.scrollTop = log.scrollHeight;
    return div;
  };
  const post = (path, data) => fetch(API + path, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  }).then((res) => { if (!res.ok) throw new Error(res.status); return res.json(); });

  async function send(message) {
    say(message, "me");
    const reply = say("Typing…", "bot");
    try {
      const data = await post("/chat", { message, history: history.slice(-10) });
      reply.textContent = data.reply;
      history.push({ role: "user", content: message }, { role: "assistant", content: data.reply.slice(0, 2000) });
      if (data.book) showForm();
    } catch {
      reply.textContent = "Sorry, I couldn't answer right now. Please email dev.shohanur@gmail.com.";
    }
  }

  function showForm() {
    if ($("pc-lead")) return $("pc-lead").scrollIntoView({ behavior: "smooth" });
    const form = document.createElement("form");
    form.id = "pc-lead";
    form.className = "pc-msg pc-bot";
    form.innerHTML = `
      <strong>📅 Book an appointment</strong>
      <label>Your name *<input name="name" required maxlength="100" autocomplete="name"></label>
      <label>Email *<input name="email" type="email" required maxlength="200" autocomplete="email"></label>
      <label>Phone / WhatsApp<input name="phone" type="tel" maxlength="40" autocomplete="tel"></label>
      <label>What do you need? *<select name="service" required><option value="">Choose…</option>${SERVICES.map((s) => `<option>${s}</option>`).join("")}</select></label>
      <label>Preferred date &amp; time *<input name="preferred_time" type="datetime-local" required></label>
      <label>Project details<textarea name="details" rows="3" maxlength="1000"></textarea></label>
      <button>Request appointment</button>`;
    const now = new Date();
    form.elements.preferred_time.min = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const lead = Object.fromEntries(new FormData(form));
      lead.preferred_time = `${lead.preferred_time.replace("T", " ")} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
      form.querySelector("button").disabled = true;
      try {
        await post("/lead", lead);
        form.remove();
        say(`✅ Thanks ${lead.name}! Your request is saved. Shohan will email you to confirm the appointment.`, "bot");
      } catch {
        form.querySelector("button").disabled = false;
        say("Sorry, that didn't go through. Please check the form or email dev.shohanur@gmail.com.", "bot");
      }
    };
    log.append(form);
    log.scrollTop = log.scrollHeight;
    form.querySelector("input").focus();
  }

  const toggle = () => { $("pc-box").hidden = !$("pc-box").hidden; if (!$("pc-box").hidden) $("pc-in").focus(); };
  $("pc-btn").onclick = toggle;
  $("pc-x").onclick = toggle;
  $("pc-chips").onclick = (e) => {
    const chip = e.target.closest("button");
    if (chip) chip.dataset.q ? send(chip.dataset.q) : showForm();
  };
  $("pc-form").onsubmit = (e) => {
    e.preventDefault();
    const message = $("pc-in").value.trim();
    $("pc-in").value = "";
    if (message) send(message);
  };
  say("Hi! 👋 I'm Shohan's assistant. What do you need today? Pick an option below or type your question.", "bot");
})();
