import requests
import time
import json

class WeatherService:
    def __init__(self):
        self.api_keys = {
            'provider1': 'YOUR_API_KEY_1',  # Replace with actual API keys
            'provider2': 'YOUR_API_KEY_2',  # Replace with actual API keys
            'provider3': 'YOUR_API_KEY_3'   # Replace with actual API keys
        }
        self.cache = {}
        self.rate_limit = 60  # Example rate limit, adjust per provider
        self.last_request_time = 0

    def get_weather(self, location):
        # Check cache first
        if location in self.cache:
            return self.cache[location]
        
        # Check rate limiting
        current_time = time.time()
        if current_time - self.last_request_time < self.rate_limit:
            time.sleep(self.rate_limit - (current_time - self.last_request_time))

        try:
            weather_data = self.fetch_weather_from_primary_provider(location)
            self.cache[location] = weather_data  # Cache the result
            self.last_request_time = time.time()
            return weather_data
        except Exception as e:
            print(f"Error fetching from primary provider: {e}")
            # Attempt to fallback to secondary provider
            try:
                weather_data = self.fetch_weather_from_secondary_provider(location)
                self.cache[location] = weather_data
                return weather_data
            except Exception as e:
                print(f"Error fetching from secondary provider: {e}")
                return None

    def fetch_weather_from_primary_provider(self, location):
        response = requests.get(f'https://api.provider1.com/weather?location={location}&apikey={self.api_keys['provider1']}')
        response.raise_for_status()  # Raise an error for bad responses
        return response.json()

    def fetch_weather_from_secondary_provider(self, location):
        response = requests.get(f'https://api.provider2.com/weather?location={location}&apikey={self.api_keys['provider2']}')
        response.raise_for_status()
        return response.json()

    def clear_cache(self):
        self.cache.clear()  # Clear the cache if needed

# Usage:
# weather_service = WeatherService()
# weather = weather_service.get_weather('New York')
# print(weather)