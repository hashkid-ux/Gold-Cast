import requests, json

r = requests.get("http://127.0.0.1:5000/api/chart-data")
d = r.json()
c = d["chart"]
print(f"Total points: {len(c)}")
print(f"First point: actual=${c[0]['actual']}, predicted=${c[0]['predicted']}")
print(f"Last point:  actual=${c[-1]['actual']}, predicted=${c[-1]['predicted']}")
print(f"All have actual+predicted? {all('actual' in p and 'predicted' in p for p in c)}")
print(f"Sample keys: {list(c[0].keys())}")
