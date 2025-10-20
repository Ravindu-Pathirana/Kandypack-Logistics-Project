from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import orders, trains, reports, products, employees, auth, routes

app = FastAPI(
    title="Kandypack Logistics Backend",
    description="Rail and road supply chain distribution system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(routes.router)   
# app.include_router(orders.router)
# app.include_router(trains.router)
# app.include_router(reports.router)
# app.include_router(products.router)
# app.include_router(employees.router)

@app.get("/")
def root():
    return {"message": "kandypack backend."}
