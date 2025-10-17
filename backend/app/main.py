from fastapi import FastAPI
from app.routers import orders, trains, reports,products, employees, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI (
    title="Kandypack Logistics Backend",
    description="Rail and road supply chain distribution system",
    version='1.0.0' 
)


#register routers
app.include_router(auth.router)
# app.include_router(orders.router)
# app.include_router(trains.router)
app.include_router(reports.router)
# app.include_router(products.router)
# app.include_router(employees.router)


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


