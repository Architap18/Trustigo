from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

csv1 = "just,some,random,strings\na,b,c,d\ne,f,g,h"
csv2 = "buyer-name,item-price\nBob,10.00\nAlice,$50"
csv3 = "transaction_id\n1\n2\n3"

for i, csv_data in enumerate([csv1, csv2, csv3]):
    with open(f"test_random_{i}.csv", "w") as f:
        f.write(csv_data)
        
    with open(f"test_random_{i}.csv", "rb") as f:
        res = client.post("/upload-csv", files={"file": (f"test_random_{i}.csv", f, "text/csv")})
        print(f"Random File {i} Upload Status:", res.status_code, res.json())
