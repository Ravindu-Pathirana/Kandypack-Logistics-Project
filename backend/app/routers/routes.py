# routes.py
from fastapi import APIRouter, HTTPException
from app.models.routes_models import Route
from app.crud import routes_crud as crud

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.get("/")
def read_routes():
    return crud.get_all_routes()

@router.get("/{route_id}")
def read_route(route_id: str):
    route = crud.get_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.post("/")
def create_new_route(route: Route):
    return crud.create_route(route)

@router.put("/{route_id}")
def update_route(route_id: str, route: Route):
    success = crud.update_route(route_id, route)
    if not success:
        raise HTTPException(status_code=404, detail="Route not found")
    return {"message": "Route updated successfully"}

@router.delete("/{route_id}")
def delete_route(route_id: str):
    success = crud.delete_route(route_id)
    if not success:
        raise HTTPException(status_code=404, detail="Route not found")
    return {"message": "Route deleted successfully"}
