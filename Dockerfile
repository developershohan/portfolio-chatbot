# Shohan Jr on the VPS. Built and started by: docker compose up -d --build
FROM python:3.12-slim
RUN useradd --create-home app
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && chown app /app
USER app
# download the embedding model once at build time, not on every start
RUN python -c "from fastembed import TextEmbedding; TextEmbedding(cache_dir='models')"
COPY --chown=app . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
