# 🤖 Fullstack Monorepo PRD – AI Prompt

Ads Course & Platform

---

# 🎯 Role Definition (for AI)

أنت Senior Fullstack Engineer بخبرة Production عالية.
أي قرار تقني يجب أن يركز على:

* البساطة
* القابلية للتوسع
* الأداء
* سهولة الصيانة
* إعادة استخدام الكود

المشروع مبني بأسلوب Monorepo.

---

# 📌 Project Overview

منصة تعليمية وإعلانية.

تسمح للمستخدمين بـ:

* تصفح الدورات  

وتسمح للإدارة بـ:

* إدارة اعلانات الدورات
* إدارة التصنيفات  
* إدارة المستخدمين
* التحكم بالمحتوى

يوجد:

* Web App
* Admin Panel
* Mobile App
* Backend API

---

# 🧱 Tech Stack

## Backend

* Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, MVC Architecture, Middleware, TypeScript

## Frontend Web

* Next.js, React.js, Tailwind CSS, shadcn/ui, React Hook Form, Zod, React Query

## Admin Panel

* Next.js, Tailwind CSS, shadcn/ui, React Hook Form, Zod, React Query, API Client

## Mobile App

* React Native, Expo, NativeWind, React Query, React Navigation

## Monorepo

* Turborepo, pnpm workspace

---

# 🗂️ Database Schema

## 👤 Users

_id, fullName, email, password, role, avatar, createdAt

## 📚 Courses

_id, title, description, thumbnail, price, categoryId, isPublished, createdAt

## 🏷️ Categories

_id, name, image, slug, createdAt 

---

# 🔗 العلاقات

Course → Category
Ad → مستقل
User → Role

---

# 🌐 API Endpoints

## Auth

```yaml
POST /auth/register
POST /auth/login
GET /auth/me
```

## Users

```yaml
GET /users/profile
PUT /users/profile
```

## Courses

```yaml
GET /courses
GET /courses/:id
```

## Categories

```yaml
GET /categories
GET /categories/:id
```

## Admin Users

```yaml
GET /admin/users
POST /admin/users
GET /admin/users/:id
PUT /admin/users/:id
DELETE /admin/users/:id
```

## Admin Courses

```yaml
GET /admin/courses
POST /admin/courses
GET /admin/courses/:id
PUT /admin/courses/:id
DELETE /admin/courses/:id
```

## Admin Categories

```yaml
GET /admin/categories
POST /admin/categories
GET /admin/categories/:id
PUT /admin/categories/:id
DELETE /admin/categories/:id
```

## 🛡️ Security & Best Practices

* JWT Authentication
* Protected Admin Routes
* Validation on all inputs
* Rate Limiting
* Error Handling Middleware
* No sensitive data exposed
* Use httpOnly cookies when needed

---

# 📦 Coding Standards

* TypeScript strict mode
* ESLint + Prettier
* camelCase naming
* No any type
* Modular Architecture
* Reusable Components

---

# 🧪 Error Response

```json
{
  "error": true,
  "message": "Readable error message"
}
```

---

# 🧠 Architecture Principle

Frontend مسؤول فقط عن:

* عرض البيانات
* إرسال الطلبات
* فتح الـ dialogs
* إدارة الـ UI state

Backend مسؤول عن:

* Validation
* Business Logic
* Pagination
* Filtering
* Authentication
* Authorization

---

# 🗂️ Monorepo Structure

```yaml
project/
│
├── apps/
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── courses/
│   │   │   │   ├── categories/ 
│   │   │   │
│   │   │   ├── middlewares/
│   │   │   ├── utils/
│   │   │   ├── config/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   │
│   │   └── package.json
│   │
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── admin/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── middleware.ts
│   │   └── package.json
│   │
│   └── mobile/
│       ├── src/
│       │   ├── screens/
│       │   ├── components/
│       │   ├── navigation/
│       │   ├── hooks/
│       │   ├── services/
│       │   └── lib/
│       │
│       └── package.json
│
├── packages/
│   ├── api-client/
│   ├── ui/
│   ├── validation/
│   ├── types/
│   ├── constants/
│   └── utils/
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

# 🔌 API Client

## packages/api-client

* fetch wrapper
* Authorization header
* baseURL
* error normalization
* reusable requests

Example:

```ts
apiClient.get('/courses')
```

---

# 🔁 React Query Pattern

```ts
useQuery({
  queryKey: ['courses', filters, page],
  queryFn: () => courseService.list(filters),
})
```

* Server-side pagination
* Server-side filtering
* Automatic cache handling
* Refetch after mutations

---

# 🪟 Dialog Pattern

* Create Dialog
* Edit Dialog
* Delete Confirmation Dialog

No separate edit pages.

---

# 🔐 Auth Flow

* Register
* Login
* JWT Token
* Protected routes
* Middleware auth guard

---

# 🚫 ممنوع

* Server Actions
* Complex State Managers
* Business Logic inside Frontend
* Over abstraction
* Duplicate Components

---

# 🧠 AI Prompt Injection

نفّذ المشروع وفق هذه البنية فقط.

أي قرار تقني يجب أن يكون:

* بسيط
* Production Ready
* قابل للتوسع
* سهل الصيانة
* بدون تعقيد زائد

أي Feature خارج الـ MVP يجب السؤال قبل إضافته.
