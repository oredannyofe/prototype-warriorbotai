import httpx

async def send_push_to_expo(expo_push_token: str, title: str, body: str):
    if not expo_push_token.startswith("ExponentPushToken") and not expo_push_token.startswith("ExpoPushToken"):
        return {"ok": False, "error": "invalid_token"}
    payload = {
        "to": expo_push_token,
        "title": title,
        "body": body,
        "sound": "default",
        "data": {"source": "warriorbot"}
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post("https://exp.host/--/api/v2/push/send", json=payload)
            r.raise_for_status()
            return r.json()
    except Exception as e:
        return {"ok": False, "error": str(e)}
