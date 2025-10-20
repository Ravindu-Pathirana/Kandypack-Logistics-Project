from fastapi import APIRouter, HTTPException, Query
from app.crud import trains_crud

router = APIRouter(prefix="/trains", tags=["trains"])

@router.get("/")
def list_trains():
    try:
        return trains_crud.get_train_schedules()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def add_occasional_trip(train: dict):
    # expects departure_date_time, arrival_date_time = 'YYYY-MM-DD HH:MM:SS'
    try:
        # normalize potential 'YYYY-MM-DDTHH:MM' from frontend
        for k in ("departure_date_time", "arrival_date_time"):
            if "T" in train.get(k, ""):
                core = train[k].replace("T", " ").split("Z")[0]
                if len(core) == 16:  # no seconds
                    core += ":00"
                train[k] = core

        # normalize status
        s = (train.get("status") or "").strip().lower().replace(" ", "-")
        if s in {"on-time", "on", "on-time"}:
            train["status"] = "on-time"
        elif s in {"delayed"}:
            train["status"] = "delayed"
        else:
            train["status"] = "on-time"

        new_id = trains_crud.create_train(train)
        return {"train_id": new_id}
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

@router.post("/templates/")
def add_train_template(tmpl: dict):
    try:
        # normalize times to HH:MM:SS
        for k in ("departure_time", "arrival_time"):
            v = str(tmpl.get(k, "")).strip()
            if len(v) == 5:  # e.g. "08:00"
                v += ":00"
            tmpl[k] = v

        # frequency_days array -> csv; default full week
        freq = tmpl.get("frequency_days")
        if isinstance(freq, list):
            if len(freq) == 0:
                # 🔑 Treat empty list as "daily train" (all days)
                tmpl["frequency_days"] = "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"
            else:
                tmpl["frequency_days"] = ",".join(freq)
        elif not freq:
            tmpl["frequency_days"] = "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"

        # status normalize
        s = (tmpl.get("status") or "").strip().lower().replace(" ", "-")
        tmpl["status"] = "on-time" if s in {"on-time", "on", "on time"} else "delayed"

        new_id = trains_crud.create_train_template(tmpl)
        return {"template_id": new_id}
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

@router.put("/{train_id}")
def update_train(train_id: int, updates: dict):
    try:
        # allow status/capacity/time changes
        if "status" in updates:
            s = (updates["status"] or "").strip().lower().replace(" ", "-")
            if s in {"on-time", "on", "on time"}:
                updates["status"] = "on-time"
            elif s == "delayed":
                updates["status"] = "delayed"
            elif s == "cancelled":
                updates["status"] = "cancelled"

        for k in ("departure_date_time", "arrival_date_time"):
            if k in updates and "T" in str(updates[k]):
                core = updates[k].replace("T", " ").split("Z")[0]
                if len(core) == 16:  # add seconds
                    core += ":00"
                updates[k] = core

        ok = trains_crud.update_train(train_id, updates)
        if not ok:
            raise HTTPException(status_code=404, detail="Train not found or no changes")
        return {"message": "Train updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

@router.delete("/{train_id}")
def cancel_train(train_id: int):
    try:
        ok = trains_crud.cancel_train(train_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Train not found")
        return {"message": "Train cancelled"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

@router.post("/generate")
def generate_now(days: int = Query(14, ge=1, le=60)):
    """
    Manually populate Train from TrainTemplate for the next N days.
    Use this so you can SEE daily/weekly templates immediately in the UI.
    """
    try:
        cnt = trains_crud.generate_horizon(days)
        return {"generated_window_days": days, "current_window_rows": cnt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
