from fastapi.testclient import TestClient
from app.main import app

def test_health():
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("ok") is True


def test_register_login_and_risk():
    client = TestClient(app)
    email = "tester@example.com"
    password = "password123"
    r = client.post("/auth/register", json={"email": email, "password": password})
    assert r.status_code == 200
    token = r.json()["access_token"]
    # risk without auth
    r1 = client.post("/risk/predict", json={"pain_level": 5, "hydration_ml": 1000, "activity_level": 4, "heart_rate": 100, "spo2": 95})
    assert r1.status_code == 200
    # risk with auth
    r2 = client.post("/risk/predict", headers={"Authorization": f"Bearer {token}"}, json={"pain_level": 8, "hydration_ml": 800, "activity_level": 6, "heart_rate": 120, "spo2": 90})
    assert r2.status_code == 200
    data = r2.json()
    assert "risk_level" in data