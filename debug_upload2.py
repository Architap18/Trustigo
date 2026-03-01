import requests

url = "http://127.0.0.1:8089/upload-csv"
files = {'file': open('test_amazon.csv', 'rb')}
response = requests.post(url, files=files)

print("Status Code:", response.status_code)
print("Response Text:", response.text)
