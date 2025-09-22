from fastapi import FastAPI
# from .routers import orders, trains, reports

app = FastAPI (
    title="Kandypack Logistics Backend",
    description="Rail and road supply chain distribution system",
    version='1.0.0' 
)


#register routers
# app.include_router(orders.router)


@app.get("/")
def root():
    return {
        "message": "kandypack backend."
    }