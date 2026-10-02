# AI-Powered LMS — System Architecture

## Gap analysis (existing Bolt scaffold)

| Area | What existed | Required target |
|------|--------------|-----------------|
| Backend | Supabase (Postgres + RLS) | FastAPI + JWT + Motor/MongoDB |
| Database | SQL migrations + `vector` extension | MongoDB Atlas + Vector Search |
| Auth | Supabase Auth | Custom JWT (bcrypt + passlib) |
| Frontend | Angular shell, routes, models, layout | Same UX, wired to FastAPI via HttpClient |
| Feature pages | Routes only — **no feature components** | Full student / instructor / admin UI |
| AI | Client stubs toward Edge Functions | LangChain + Gemini + RAG in FastAPI |

**Decision:** Keep domain models and Angular route map from the scaffold. Replace Supabase with a modular FastAPI backend. Rebuild feature pages against REST APIs.

---

## 1. System architecture

```
Angular (frontend/)
    │  JWT in Authorization header
    ▼
FastAPI (backend/app)
    ├── Auth (register/login/me)
    ├── LMS services (courses, lessons, enrollments, progress, quizzes)
    └── AI services (tutor, summarize, quiz-gen, performance, recommendations)
            │
            ├── LangChain + Gemini
            └── RAG (embeddings → MongoDB Atlas Vector Search)
    ▼
MongoDB Atlas
    users, courses, lessons, enrollments, progress,
    quizzes, quiz_attempts, materials, document_chunks,
    ai_conversations, categories, ...
```

---

## 2. Database design (MongoDB)

Collections use ObjectId `_id`. Soft relationships via string IDs.

| Collection | Purpose |
|------------|---------|
| `users` | Accounts, roles, hashed passwords |
| `categories` | Course categories |
| `courses` | Learning programs |
| `lessons` | Units inside a course |
| `enrollments` | Student ↔ course (unique pair) |
| `progress` | Per-lesson completion |
| `quizzes` / `quiz_attempts` / `quiz_attempt_counters` | Assessment, scored submissions, atomic attempt limits |
| `assignments` / `submissions` | Optional homework |
| `course_materials` | Uploaded PDFs/docs |
| `document_chunks` | RAG chunks + embeddings |
| `ai_conversations` | Tutor chat history |
| `ai_summaries` | Cached summaries |
| `ai_recommendations` | Personalized suggestions |

### Key indexes

- `users.email` — unique  
- `courses.instructorId`, `courses.status`  
- `lessons.courseId`  
- `enrollments (studentId, courseId)` — **unique compound**  
- `quiz_attempts.studentId`, `quiz_attempts.quizId`  
- `quiz_attempts (quizId, studentId, attemptNumber)` — **unique**  
- `quiz_attempt_counters (quizId, studentId)` — **unique**  
- `document_chunks.courseId` + vector index on `embedding`

---

## 3. API structure (prefix `/api`)

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Users | CRUD + activate/deactivate (admin) |
| Courses | CRUD + `POST /{id}/publish`; `GET /courses` supports search, category, difficulty, sort, and pagination; `GET /courses/categories` lists visible categories |
| Lessons | Nested under courses + by id |
| Enrollments | `POST /courses/{id}/enroll`, `GET /enrollments/my-courses` |
| Progress | get course progress, complete lesson |
| Quizzes | instructor/admin CRUD; enrolled student retrieval (without correct answers), scored submissions, and own attempt history |
| Materials | upload, list, delete |
| AI | tutor, summarize, generate-quiz, recommendations, analyze-performance |
| Analytics | student / instructor / admin dashboards |

Consistent envelope:

```json
{ "success": true, "message": "...", "data": {} }
```

Course listing keeps the legacy array response when pagination is omitted. Supplying
`page` returns a paginated object with `items`, `total`, `page`, `pageSize`, and
`totalPages`; filters include `search`, `category`, `difficulty`, and `sort`.

Quiz authoring is available to course owners and admins through
`POST/GET /courses/{course_id}/quizzes` and `PUT/DELETE /quizzes/{quiz_id}`.
Enrolled students use `GET /courses/{course_id}/quizzes/available`,
`GET /quizzes/{quiz_id}`, `POST /quizzes/{quiz_id}/attempts`, and
`GET /quizzes/{quiz_id}/attempts`. Student quiz payloads omit answer keys;
submission scoring and attempt limits are enforced by the backend. The quiz
time-limit field is currently informational and is not enforced as a deadline.

---

## 4. Angular structure

```
frontend/src/app/
  core/       guards, interceptors, services, models
  features/   auth | student | instructor | admin
  shared/     reusable UI
  layout/     navbar, sidebar, footer
```

Guards: `authGuard`, `roleGuard(['STUDENT' | 'INSTRUCTOR' | 'ADMIN'])`.  
Interceptor attaches JWT. Backend always re-checks roles.

---

## 5. Authentication flow

1. Register → bcrypt hash → store user → return JWT  
2. Login → verify hash → return JWT + profile  
3. Client stores token (localStorage for student project; HttpOnly cookie optional later)  
4. `Authorization: Bearer <token>` on each request  
5. Dependency `get_current_user` decodes JWT; `require_role(...)` enforces RBAC

---

## 6. Role-based authorization flow

| Role | Capabilities |
|------|----------------|
| STUDENT | Browse published, enroll, learn, quiz, AI tutor (enrolled only) |
| INSTRUCTOR | Own courses/lessons/quizzes/materials; AI tools |
| ADMIN | All users, all courses, categories, platform stats |

Frontend hides UI; **backend never trusts client role claims for authorization** beyond the JWT subject + DB role lookup.

---

## 7. AI architecture

```
Request → FastAPI route → permission check → AI service
  → (optional) RAG retrieve
  → LangChain prompt template
  → Gemini
  → validate structured output
  → persist (conversation / quiz draft / summary)
  → response
```

Dedicated modules: `tutor.py`, `quiz_generator.py`, `summarizer.py`, `performance.py`, `recommendations.py`.

---

## 8. RAG architecture

**Ingest:** upload → extract text → chunk → embed → `document_chunks`  
**Query:** question → embed → vector search (scoped by `courseId` + enrollment) → context prompt → Gemini  

If context is empty/weak → reply that material was not found in course content.

---

## 9. Development roadmap

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Project setup | **In progress** |
| 2 | MongoDB connection + indexes | Next |
| 3 | Auth (register/login/me) | Planned |
| 4 | RBAC helpers | Planned |
| 5–6 | Courses & lessons | Planned |
| 7–8 | Enrollment & progress | Planned |
| 9 | Quizzes | Implemented |
| 10–12 | Angular dashboards | Planned |
| 13–14 | Materials + RAG | Planned |
| 15–19 | AI features | Planned |
| 20–21 | Tests + deploy | Planned |

---

## 10. Security checklist

- No plaintext passwords; no secrets in repo  
- Ownership checks on course/lesson mutations  
- Quiz answers stripped until submit  
- AI retrieval scoped to enrolled courses  
- Upload type/size validation  
- CORS limited to `FRONTEND_URL`
