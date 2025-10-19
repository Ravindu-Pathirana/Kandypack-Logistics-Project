from fastapi import FastAPI
from app.routers import orders, trains, reports,products, employees, auth, drivers, trucks, stores, cities, customers1, customers, customertypes
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
app.include_router(auth.router, tags=["auth"])
app.include_router(employees.router, tags=["employees"])
app.include_router(drivers.router, tags=["drivers"])
app.include_router(reports.router, tags=["reports"])
app.include_router(trucks.router,tags=["trucks"])
app.include_router(stores.router,tags=["stores"])
app.include_router(cities.router,tags=["products"])
app.include_router(customers1.router,tags=["customers"])
app.include_router(orders.router)
app.include_router(customers.router)
app.include_router(trains.router)
app.include_router(customertypes.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "kandypack backend."
    }


