# StudentTM — Student Task Manager

A full-stack task management web application built for students to organize assignments, track deadlines.

---

## Tech Stack

**Frontend:** Angular 20, TypeScript

**Backend:** ASP.NET Core 8, C#, ADO.NET, SQL Server

**Auth:** JWT Bearer Tokens, BCrypt

---

## Features

- Register / Login with JWT authentication
- Create, Edit, Delete tasks
- Priority levels: Low, Medium, High
- Status tracking: Pending, In Progress, Completed
- Task categories: Assignment, Exam, Personal, Project, Other
- Search by title or description
- Filter by status and category
- Overdue task highlighting
- Calendar view with task dots by due date
- Productivity tracker (today vs yesterday)
- Streak counter

---

## Setup

### Backend
1. Create `StudentTM` database in SQL Server
2. Run all stored procedures from the `/SQL` folder
3. Update `appsettings.json` with your connection string and JWT key
4. Run: `dotnet run`
→ API runs at `https://localhost:7134`

### Frontend
```bash
cd UI/studenttm-ui
npm install
ng serve
```
→ App runs at `http://localhost:4200`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/Auth/Register` | Register |
| POST | `/api/Auth/Login` | Login |
| POST | `/api/Task` | Create task |
| GET | `/api/Task` | Get all tasks |
| GET | `/api/Task/{id}` | Get tasks by id |
| PUT | `/api/Task/{id}` | Update task |
| DELETE | `/api/Task/{id}` | Delete task |
| GET | `/api/Task/pending` | Pending tasks |
| GET | `/api/Task/inprogress` | In progress tasks |
| GET | `/api/Task/completed` | Completed tasks |
| GET | `/api/Task/sorted-by-priority` | Sort by priority |
| GET | `/api/Task/streak` | Task streaks |

---

## Author

**Praba Narayanan** — [@PrabaNarayanan21](https://github.com/PrabaNarayanan21)
