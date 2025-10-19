from fastapi import FastAPI
from app.routers import orders, trains, reports,products, employees, auth, drivers, trucks, stores, cities, customers1
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI (
    title="Kandypack Logistics Backend",
    description="Rail and road supply chain distribution system",
    version='1.0.0' 
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


