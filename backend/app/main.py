from fastapi import FastAPI
from app.routers import orders, trains, reports,products, employees, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI (
    title="Kandypack Logistics Backend",
    description="Rail and road supply chain distribution system",
    version='1.0.0' 
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Match your frontend port
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

#register routers
app.include_router(auth.router)
# app.include_router(orders.router)
app.include_router(trains.router)
# app.include_router(reports.router)
# app.include_router(products.router)
# app.include_router(employees.router)


@app.get("/")
def root():
    return {
        "message": "kandypack backend."
    }