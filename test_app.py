"""Quick self-check, no API key or database needed:  python test_app.py"""
import os

os.environ.setdefault("GROQ_API_KEY", "test")

from io import BytesIO

from fastapi.testclient import TestClient
from langchain_core.runnables import RunnableLambda
from openpyxl import load_workbook

import app

# fake LLM: records what it was sent and asks for the booking form
seen = []
app.chain = app.prompt | RunnableLambda(lambda p: seen.append(p.to_messages()) or "Happy to help, Shihab! [BOOK] [NAME: Shihab]")
client = TestClient(app.app)

reply = client.post("/chat", json={"message": "Can we meet?", "history": [
    {"role": "user", "content": "Do you build plugins?"}, {"role": "assistant", "content": "Yes!"}]}).json()
assert reply == {"reply": "Happy to help, Shihab!", "book": True, "prefill": {"name": "Shihab"}}, reply
assert [m.type for m in seen[0]] == ["system", "human", "ai", "human"], "chat history must reach the LLM"

# the form opens when the visitor asks for it, even if the AI forgets [BOOK]
app.chain = app.prompt | RunnableLambda(lambda p: "Sure.")
for message, wants_form in [("ami form chai", True), ("ফর্মটা দাও", True), ("appointment nite chai", True),
                            ("What services do you offer?", False), ("সোহানের ফেসবুক লিংক?", False),
                            ("Tell me about Bookkeeping By Alo", False)]:
    assert client.post("/chat", json={"message": message}).json()["book"] is wants_form, message

assert client.post("/chat", json={"message": "x" * 501}).status_code == 422
assert client.post("/lead", json={"name": "A", "email": "nope", "service": "x", "preferred_time": "y"}).status_code == 422
assert client.get("/leads.xlsx").status_code == 401

# a booking is saved, then emailed (fake database + fake email sender)
class FakeDB:
    def __enter__(self): return self
    def __exit__(self, *exc): pass
    def execute(self, *args): pass


sent = []
app.database = FakeDB
app.httpx.post = lambda url, **kw: sent.append(kw["json"]) or app.httpx.Response(200, request=app.httpx.Request("POST", url))
os.environ["RESEND_API_KEY"] = "test"
lead = {"name": "Rahim", "email": "rahim@example.com", "service": "WooCommerce", "preferred_time": "2026-12-01 15:30"}
assert client.post("/lead", json=lead).json() == {"ok": True}
assert sent[0]["reply_to"] == "rahim@example.com" and "Rahim" in sent[0]["subject"], sent

cell = load_workbook(BytesIO(app.to_excel(["name"], [['=HYPERLINK("http://evil")']]))).active["A2"]
assert cell.data_type == "s", "visitor text starting with = must stay text in Excel, not become a formula"

print("all checks passed")
