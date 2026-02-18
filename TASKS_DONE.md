# Task: Debug Identity Swap & Logging Issues

- [x] Analyze `tracking/face_tracker.py` and `tracking/person_tracker.py` to understand how IDs are assigned. <!-- id: 0 -->
- [x] Analyze `recognition/face_identifier.py` to see how recognition results are passed to the tracker. <!-- id: 1 -->
- [x] Analyze `attendance/attendance_manager.py` to see how logs are generated from tracking data. <!-- id: 2 -->
- [x] Identify the root cause of the identity swap (likely index mismatch or race condition). <!-- id: 3 -->
- [x] Create a reproduction script or test case if possible (or just fix based on code logic). <!-- id: 4 -->
- [x] Implement the fix. <!-- id: 5 -->
- [x] Verify the fix. <!-- id: 6 -->

# Task: Investigate & Run Frontend

- [x] Analyze `frontend/package.json` to identify run scripts. <!-- id: 7 -->
- [x] Explore `frontend/src` or `frontend/app` (Next.js/React structure) to understand the UI. <!-- id: 8 -->
- [x] Connect Frontend to Backend (Replace mock data with real API calls). <!-- id: 9 -->
- [x] Document how to run the full stack (Backend + Frontend). <!-- id: 10 -->

# Task: Implement Remuneration Features (Late/Early Detection)

- [x] **Database**: Add `SystemSettings` table to store `work_start_time` and `work_end_time`. <!-- id: 11 -->
- [x] **API**: Add endpoints to GET/UPDATE these settings (`/api/settings`). <!-- id: 12 -->
- [x] **Logic**: Update `AttendanceDataReader` to calculate "Late" and "Early Left" status based on settings. <!-- id: 13 -->
- [x] **Frontend**: Create "Attendance Policy" settings in the Settings page. <!-- id: 14 -->
- [x] **Frontend**: Display "Late" / "Early" tags in the Workers list and Reports. <!-- id: 15 -->

# Task: Theme Customization

- [x] Modify `globals.css` to change dark mode background to Black/Neural. <!-- id: 16 -->
- [x] Ensure Primary color remains Green. <!-- id: 17 -->

# Task: Clean Up Mock Data

- [x] Remove mock data from **Dashboard** (Activity Feed). <!-- id: 18 -->
- [x] Remove mock data from **Attendance Log** page. <!-- id: 19 -->
- [x] Remove mock data from **Analytics** page. <!-- id: 20 -->

# Task: Cleanup Duplicate Frontend

- [x] Remove root-level `app`, `components`, `lib`, `hooks` folders. <!-- id: 21 -->
- [x] Remove root-level config files (`tailwind.config.ts`, `next.config.mjs`, etc.). <!-- id: 22 -->

# Task: Remove Fake Metrics

- [x] Update `/api/metrics` to calculate real `onTimePercentage`. <!-- id: 23 -->
- [x] Update `/api/metrics` to return `avgConfidence` (or 0 if not tracked). <!-- id: 24 -->
- [x] Connect Frontend Dashboard to these new API fields. <!-- id: 25 -->

# Task: Fix Empty Dashboard / Hydration Error

- [x] Handle API fetch errors gracefully in `dashboard/page.tsx` (prevent empty page). <!-- id: 26 -->
- [x] Add fallback to zero values if API fails. <!-- id: 27 -->

- [x] Suppress hydration warnings in Sidebar and Dashboard. <!-- id: 28 -->
- [x] Verify `run_system.py` functionality. <!-- id: 29 -->
- [x] Connect **History Page** to real API. <!-- id: 30 -->
- [x] Connect **Analytics Page** to real API. <!-- id: 31 -->
- [x] Fix "Invalid Date" in Live Status. <!-- id: 32 -->
- [x] Correct Logic for Presence Count (Active + Completed). <!-- id: 34 -->
- [x] Implement Detailed Session Logs (In/Out/Duration) in History Page. <!-- id: 35 -->
- [x] Refine History Page UI (Status, Logs, Duration) & Fix "Invalid Date". <!-- id: 36 -->
- [x] **UI Fix**: Re-implemented Profile Column & Real-Time Status in History Table (Previous apply failed). <!-- id: 37 -->
- [x] **UI Fix**: Fixed Analytics Heatmap label overlap and clarified Avg Workers calculation. <!-- id: 39 -->
- [x] **Fix**: Enable History Page to load *all* past records (not just today). <!-- id: 38 -->
- [x] **UI Update**: Clean up Login Page (Remove extra text/features, fix hydration error). <!-- id: 40 -->
- [x] **Logic Fix**: Identify and mark stale active sessions as "Incomplete" (Timeout). <!-- id: 41 -->
- [x] **UI Update**: Remove Confidence Bar (Show percentage only). <!-- id: 42 -->
- [x] **Logic Fix**: Filter Daily Occupancy by Registered Workers Only (Excludes test data). <!-- id: 43 -->
- [x] **Cleanup**: Removed dummy `TEST_EARLY`, `TEST_ONTIME`, `TEST_LATE` records from database. <!-- id: 44 -->
- [x] **UI Tweak**: Updated Out Time and Duration font color to white (matched Employee/In Time). <!-- id: 45 -->
- [x] **Deployment**: Pushed final code to GitHub (Cleaned up ignores). <!-- id: 46 -->
- [x] **Hydration Fix**: Forced `TopHeader` to render client-side to resolve ID mismatch. <!-- id: 47 -->
- [x] **Logic Fix**: Implemented **Heartbeat** mechanism (Tracking script updates file, API checks it). If system stops, "Live Count" drops to 0. <!-- id: 48 -->
- [x] **UI Fix**: Corrected "Live Status" & "Workers List" to only show **IN** if worker is currently **Active**. Checked-out workers now correctly show **OUT** (with last seen time). <!-- id: 49 -->
- [x] **UI Update**: Stale/"Did not checkout" sessions now display **"Away"** in the status badge (styled as incomplete). <!-- id: 50 -->
