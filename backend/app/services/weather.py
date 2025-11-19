import httpx
from typing import Optional, List, Dict
from collections import defaultdict

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


async def get_forecast_summary(lat: float, lon: float, days: int = 5) -> List[Dict]:
    """Fetch hourly forecast and summarize per-day averages for temperature, humidity, pressure."""
    days = max(1, min(int(days), 7))
    url = (
        "https://api.open-meteo.com/v1/forecast?latitude="
        f"{lat}&longitude={lon}&hourly=temperature_2m,relative_humidity_2m,surface_pressure&forecast_days={days}"
    )
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
            hourly = data.get("hourly", {})
            times = hourly.get("time", [])
            temps = hourly.get("temperature_2m", [])
            rhs = hourly.get("relative_humidity_2m", [])
            ps = hourly.get("surface_pressure", [])
            buckets: dict[str, dict[str, float | int]] = defaultdict(lambda: {"t_sum": 0.0, "rh_sum": 0.0, "p_sum": 0.0, "n": 0})
            for i in range(min(len(times), len(temps), len(rhs), len(ps))):
                d = str(times[i])[:10]
                b = buckets[d]
                try:
                    b["t_sum"] = float(b["t_sum"]) + float(temps[i])
                    b["rh_sum"] = float(b["rh_sum"]) + float(rhs[i])
                    b["p_sum"] = float(b["p_sum"]) + float(ps[i])
                    b["n"] = int(b["n"]) + 1
                except Exception:
                    continue
            out = []
            for day in sorted(buckets.keys())[:days]:
                b = buckets[day]
                n = max(1, int(b["n"]))
                out.append({
                    "date": day,
                    "temperature_c": round(float(b["t_sum"]) / n, 2),
                    "relative_humidity": round(float(b["rh_sum"]) / n, 2),
                    "pressure_hpa": round(float(b["p_sum"]) / n, 2),
                })
            return out
    except Exception:
        return []
