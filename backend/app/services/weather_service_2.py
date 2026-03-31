# backend/app/services/weather_service.py

import requests
from app.core.config import settings


def get_weather(city: str = "Bhopal"):
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={settings.WEATHER_API_KEY}&units=metric"

        response = requests.get(url)

        if response.status_code != 200:
            return None

        data = response.json()

        return {
            "city": data.get("name"),
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "condition": data["weather"][0]["description"]
        }

    except Exception as e:
        print("Weather API Error:", e)
        return None
