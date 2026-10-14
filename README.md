# Shohan Jr: portfolio chatbot (LangChain + RAG + FAISS)

A chat assistant for proshohan.com that answers visitors' questions about you, remembers the conversation,
and lets visitors book an appointment. Bookings are saved in a database, emailed to you, and downloadable
as an Excel sheet. Runs 24/7 on your Hostinger VPS, next to n8n.

## How it works

```
knowledge/*.md ──split──> chunks ──embed──> FAISS (vector DB)
                                                │
visitor question + chat so far ──> find 6 closest chunks
                                                │
             chunks + chat + question ──> Groq LLM ──> answer
                                                         │
                         "I want to hire you" ──> booking form ──> Postgres DB ──> email + leads.xlsx
```

| Piece | What it is | Cost |
|---|---|---|
| LangChain | glues the AI steps together | free |
| FastEmbed | turns text into vectors, runs inside the app | free, no key |
| FAISS | the vector database, finds similar chunks | free |
| Groq (GPT-OSS 120B) | the LLM that writes the answer | free tier |
| Neon | Postgres database for appointment requests | free tier |
| Resend | emails you when someone books | free tier |
| Hostinger VPS | runs the app in Docker, behind n8n's Traefik (HTTPS) | your existing VPS |

| File | Purpose |
|---|---|
| `knowledge/about.md` | what the bot knows. Edit this! Add more `.md` files any time |
| `app.py` | the RAG pipeline, chat memory, booking, email and Excel export (commented, read top to bottom) |
| `widget.js` | the chat window shown on your site (design, quick buttons, booking form) |
| `test_app.py` | quick self-check: `python test_app.py` |
| `Dockerfile`, `docker-compose.yml` | how the VPS builds and runs it |

## 1. Your secrets

1. **Groq key**: https://console.groq.com/keys → Create API key (no credit card).
2. **Database**: https://neon.com → New project (region **AWS Asia Pacific (Singapore)**) → **Connect** →
   copy the connection string (starts with `postgresql://`). The `leads` table is created automatically.
3. **Admin password**: make one up. It protects your Excel download.
4. **Email alerts** (optional): sign up at https://resend.com **with dev.shohanur@gmail.com** → API Keys → Create.

## 2. Run it on your computer (optional)

```powershell
cd D:\automation\portfolio-chatbot; .venv\Scripts\activate; copy .env.example .env; notepad .env
```

Fill in your secrets, then start it and open http://localhost:7860:

```powershell
uvicorn app:app --reload --port 7860
```

## 3. Deploy on the Hostinger VPS (first time)

1. Make the GitHub repo public: https://github.com/developershohan/portfolio-chatbot/settings →
   **Danger Zone → Change visibility → Public**. (It holds no secrets: `.env` never leaves your computer or VPS.)
2. In hPanel open **VPS → Manage → Browser terminal** (or `ssh root@2.24.130.99`).
3. Download the code and create the settings file:
   ```bash
   git clone https://github.com/developershohan/portfolio-chatbot.git /opt/portfolio-chatbot
   ```
   ```bash
   cd /opt/portfolio-chatbot && cp .env.example .env && nano .env
   ```
   Paste your secrets. Keep `DOMAIN=chat.srv1836598.hstgr.cloud` and `TRAEFIK_NETWORK=n8n_default`.
   Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`.
4. Build and start it (first build takes 2–4 minutes):
   ```bash
   docker compose up -d --build
   ```
5. Open https://chat.srv1836598.hstgr.cloud. You should see "Shohan Jr is running".
   If it doesn't load, check the logs: `docker compose logs --tail 50`

It also shows up in hPanel → **Docker Manager** as `portfolio-chatbot`, where you can restart it or read logs.

## 4. Add the chat to proshohan.com

In WordPress, **Elementor → Custom Code**, use this in the snippet (location **`</body> - End`**):

```html
<script nitro-exclude data-no-optimize="1" data-no-defer="1">
(function () {
  function load() {
    var s = document.createElement("script");
    s.src = "https://chat.srv1836598.hstgr.cloud/widget.js";
    document.body.appendChild(s);
  }
  document.readyState === "complete" ? load() : window.addEventListener("load", load);
})();
</script>
```

It loads the chat only after the page is ready, so it can never slow down your site or its preloader.
The attributes on the first line tell NitroPack and LiteSpeed Cache to leave the snippet alone.

**Then clear every cache**, or visitors keep seeing the old page: NitroPack → **Purge Cache**,
LiteSpeed Cache → **Purge All** (if installed), and hPanel → **Website → Clear cache**. Check in a private window.

## 5. See your appointment requests

Open https://chat.srv1836598.hstgr.cloud/leads.xlsx. Type any username and your `ADMIN_PASSWORD`.
You get an Excel file with every request, newest first, always up to date. They're also in Neon → **Tables → leads**.

## Updating the bot

Edit files on your computer (e.g. `knowledge/about.md`), then push:

```powershell
cd D:\automation\portfolio-chatbot; git add .; git commit -m "update"; git push
```

and in the VPS terminal pull and rebuild:

```bash
cd /opt/portfolio-chatbot && git pull && docker compose up -d --build
```

## Good to know

- Want a branded address like `chat.proshohan.com`? Add an **A record** `chat` → `2.24.130.99` in the DNS of
  proshohan.com, set `DOMAIN=chat.proshohan.com` in `/opt/portfolio-chatbot/.env`, run `docker compose up -d`,
  and update the script URL in Elementor.
- Groq retires models from time to time: if chat suddenly fails, check https://console.groq.com/docs/deprecations
  and add `MODEL=<replacement>` to `.env` (e.g. `MODEL=openai/gpt-oss-20b`), then `docker compose up -d`.
- Only `https://proshohan.com` can call the API (CORS in `app.py`). Add other domains there if needed.
- Brand colour: `--lime` at the top of the `<style>` in `widget.js`. Services in the form: `SERVICES` in `widget.js`.
