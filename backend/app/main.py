from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import orders, trains, reports, products, employees, auth, drivers, roles

app = FastAPI(
    title="Kandypack Logistics Backend",
    description="Rail and road supply chain distribution system",
    version='1.0.0'
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    # Development origins: include Vite (5173) and other dev servers (8080, 8081)
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#register routers
app.include_router(auth.router)
app.include_router(drivers.router)
app.include_router(roles.router)
# app.include_router(orders.router)
# app.include_router(trains.router)
# app.include_router(reports.router)
# app.include_router(products.router)
# app.include_router(employees.router)





@app.get("/")
def root():
    return {
        "message": "kandypack backend."
    }