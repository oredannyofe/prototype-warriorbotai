import httpx
from typing import Optional

async def get_environmental_factors(lat: Optional[float], lon: Optional[float]):
    if lat is None or lon is None:
        return {"temperature_c": None, "relative_humidity": None, "pressure_hpa": None}
    url = (
        "https://api.open-meteo.com/v1/forecast?latitude="
        f"{lat}&longitude={lon}&hourly=temperature_2m,relative_humidity_2m,surface_pressure&forecast_days=1"
    )
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
            hourly = data.get("hourly", {})
            # take first hour as proxy
            t = hourly.get("temperature_2m", [None])[0]
            rh = hourly.get("relative_humidity_2m", [None])[0]
            p = hourly.get("surface_pressure", [None])[0]
            return {"temperature_c": t, "relative_humidity": rh, "pressure_hpa": p}
    except Exception:
        return {"temperature_c": None, "relative_humidity": None, "pressure_hpa": None}
