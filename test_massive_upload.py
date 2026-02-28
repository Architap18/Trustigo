import httpx
import time

start = time.time()
with httpx.Client(timeout=120.0) as client:
    with open("massive_fraud_dataset.csv", "rb") as f:
        response = client.post("http://127.0.0.1:8000/upload-csv", files={"file": ("massive_fraud_dataset.csv", f, "text/csv")})
        print(f"Status: {response.status_code}")
        print(f"Time Taken: {time.time() - start:.2f} seconds")
