# Quick Start Commands

## Start API Server (Required)
```powershell
python scripts/run_api.py
```

## Start Dashboard (Required)
```powershell
cd backend
pnpm install  # First time only
pnpm dev
```

## Start Attendance System (Optional - for live tracking)
```powershell
python scripts/run_system.py
```

---

## Access Points
- **Dashboard**: http://localhost:3000
- **API Server**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Verify Integration
1. Start API server
2. Start dashboard
3. Dashboard should show your registered workers from `data/known_faces/`
4. Data auto-refreshes every 5 seconds
