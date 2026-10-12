# Portfolio chatbot (LangChain + RAG + FAISS)

A chat bubble for proshohan.com that answers visitors' questions about you, remembers the conversation,
and lets visitors book an appointment. Bookings are saved in a database and downloadable as an Excel sheet.
100% free to run.

## How it works

```
knowledge/*.md ──split──> chunks ──embed──> FAISS (vector DB)
                                                │
visitor question + chat so far ──> find 4 closest chunks
                                                │
             chunks + chat + question ──> Groq LLM ──> answer
                                                         │
                         "I want to hire you" ──> appointment form ──> Postgres DB ──> leads.xlsx
```

| Piece | What it is | Cost |
|---|---|---|
| LangChain | glues the AI steps together | free |
| FastEmbed | turns text into vectors, runs inside the app | free, no key |
| FAISS | the vector database, finds similar chunks | free |
| Groq (GPT-OSS 120B) | the LLM that writes the answer | free tier |
| Neon | Postgres database for appointment requests | free tier |
| Resend | emails you when someone books | free tier |
| Render | runs the Python app | free tier |
| Your Hostinger site | shows the chat bubble | what you already pay |

| File | Purpose |
|---|---|
| `knowledge/about.md` | what the bot knows. Edit this! Add more `.md` files any time |
| `app.py` | the RAG pipeline, chat memory, appointment saving and Excel export (commented, read top to bottom) |
| `widget.js` | the chat bubble, quick options and appointment form shown on your site |
| `test_app.py` | quick self-check: `python test_app.py` |
| `requirements.txt`, `.python-version` | tell Render what to install |

## 1. Get your 3 secrets

1. **Groq key**: https://console.groq.com/keys → Create API key (no credit card).
2. **Database**: https://neon.com → sign up → New project (region: **AWS Asia Pacific (Singapore)**).
   Click **Connect**, copy the connection string (starts with `postgresql://`). The `leads` table is created automatically.
3. **Admin password**: make one up. It protects your Excel download.
4. **Email alerts** (optional): sign up at https://resend.com **with dev.shohanur@gmail.com**, then
   API Keys → Create. Each booking is emailed to you; press Reply to answer the visitor directly.
   (Render's free plan blocks normal Gmail/SMTP sending, which is why we use Resend's free API.)

## 2. Run it on your computer

```powershell
cd D:\automation\portfolio-chatbot
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `.env`, paste your secrets, then:

```powershell
uvicorn app:app --reload --port 7860
```

Open http://localhost:7860 and click the 💬 bubble.

## 3. Put the code on GitHub

Create an empty repo at https://github.com/new (e.g. `portfolio-chatbot`, private is fine), then:

```powershell
git init
git add .
git commit -m "Portfolio chatbot"
git branch -M main
git remote add origin https://github.com/developershohan/portfolio-chatbot.git
git push -u origin main
```

`.gitignore` keeps your `.env` secrets off GitHub.

## 4. Deploy free on Render

In your Render project: **Create new service → Web Service** → connect GitHub → pick the repo, then:

| Setting | Value |
|---|---|
| Language | Python 3 |
| Branch | main |
| Build Command | `pip install -r requirements.txt && python -c "from fastembed import TextEmbedding; TextEmbedding(cache_dir='models')"` |
| Start Command | `uvicorn app:app --host 0.0.0.0 --port $PORT` |
| Instance Type | **Free** |
| Region | Singapore |
| Environment Variables | `GROQ_API_KEY`, `DATABASE_URL`, `ADMIN_PASSWORD`, `RESEND_API_KEY` (same values as your `.env`) |

Click **Deploy**. When it says **Live**, open `https://YOUR-APP.onrender.com` to test.

## 5. Add the bubble to proshohan.com

In WordPress, **Elementor → Custom Code → Add New** (Elementor Pro), location **`</body> - End`**,
or use the free **WPCode** plugin's footer box. Paste:

```html
<script nitro-exclude data-no-optimize="1" data-no-defer="1">
(function () {
  function load() {
    var s = document.createElement("script");
    s.src = "https://YOUR-APP.onrender.com/widget.js";
    document.body.appendChild(s);
  }
  document.readyState === "complete" ? load() : window.addEventListener("load", load);
})();
</script>
```

Don't use a plain `<script src=".../widget.js" defer>` tag: while the free Render server is asleep the browser
waits up to a minute for it, the page's `load` event never fires, and the theme's preloader stays on a black screen.
The snippet above loads the widget only after the page is ready. The attributes on the first line tell
NitroPack and LiteSpeed Cache to leave the snippet alone.

**Then clear every cache**, or only logged-in users will see the bubble (caches serve visitors an old copy of the page):
NitroPack → **Purge Cache**, LiteSpeed Cache → **Purge All** (if installed), and Hostinger hPanel → **Website → Clear cache**.
Check in a private/incognito window.

## 6. See your appointment requests

Open `https://YOUR-APP.onrender.com/leads.xlsx`. The browser asks for a login: type any username
and your `ADMIN_PASSWORD`. You get an Excel file with every request, newest first, built live from the
database, so it's always up to date. You can also browse them in Neon → **Tables → leads**.

## Updating what the bot knows

Edit or add files in `knowledge/`, then `git add . && git commit -m "update" && git push`. Render redeploys automatically.

## Good to know

- Render's free server sleeps after 15 minutes without visitors. The widget wakes it up as soon as someone
  opens your site, but the very first answer can still take up to a minute.
- Groq's free tier has daily request and token limits per model (check https://console.groq.com/settings/limits).
  Groq retires models from time to time: if chat suddenly fails, check https://console.groq.com/docs/deprecations
  and add a `MODEL` environment variable on Render with the replacement (e.g. `openai/gpt-oss-20b`).
- Only `https://proshohan.com` can call the API (CORS in `app.py`). Add other domains there if needed.
- Brand colour: change `--lime` at the top of the `<style>` in `widget.js`. Services in the form: `SERVICES` in `widget.js`.
