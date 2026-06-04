from fastapi import FastAPI
from routes import disease  # <--- আপনার বানানো রাউটটি ইমপোর্ট করুন

app = FastAPI()

# when someone sends a GET request to / this address, run the function below
@app.get("/")
def root():
    return {"status": "ok"}

# আপনার এ্যান্ডপয়েন্টটি অ্যাপে রেজিস্টার করুন
app.include_router(disease.router)  # <--- এটি যুক্ত করুন

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
