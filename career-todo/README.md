# Career To-Do List

A React + Vite task tracker for daily career preparation.

## Features
- Add, edit, and delete tasks
- Set a time limit in minutes (120 = 2 hours)
- Countdown timer with start, pause, and reset
- Alarm and optional browser notification when a timer ends
- Add subtasks and mark them complete
- Daily progress summaries
- Saves task data in browser localStorage
- Responsive desktop and mobile layout
- Displays your December 30, 2026 career goal deadline

## Requirements
Install Node.js (LTS recommended), which includes npm.

## Run locally
1. Extract the ZIP file.
2. Open the `career-todo` folder in VS Code.
3. Open a terminal in that folder.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the localhost URL shown in the terminal (usually `http://localhost:5173`).

## Notes
- Keep the page open for countdown timers and alarms to work reliably.
- Click **Enable alarm / notifications** to allow browser notifications and test audio playback.
- The alarm sound is loaded from a public URL and requires internet access.
- Tasks are stored in this browser on this device; they are not synced to the cloud.
- This is a starter app. It does not yet create separate recurring task plans or a historical progress report for every date through December 30.
