from fastapi import FastAPI

app = FastAPI()

# when someone sends a GET request to / this address, run the function below
@app.get("/")
def root():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
