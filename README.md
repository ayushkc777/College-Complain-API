# College Complaint API

A simple College Complaint REST API for mobile and web applications.

**This project is solely for college project purposes only.**

---

## Database Design (MongoDB)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Batch       │       │     Student     │       │    Category     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ _id             │◄──────│ batchId (ref)   │       │ _id             │
│ batchName       │       │ _id             │       │ name            │
│ status          │       │ name            │       │ description     │
│ createdAt       │       │ email           │       │ status          │
└─────────────────┘       │ username        │       │ createdAt       │
                          │ password        │       └─────────────────┘
                          │ phoneNumber     │               │
                          │ profilePicture  │               │
                          │ createdAt       │               ▼
                          └─────────────────┘       ┌─────────────────┐
                                  ▲                 │      Item       │
                                  │                 ├─────────────────┤
                                  │                 │ _id             │
                                  ├─────────────────│ reportedBy (ref)│
                                  │                 │ claimedBy (ref) │
                                  │                 │ category (ref)  │
                                  │                 │ itemName        │
                                  │                 │ description     │
                                  │                 │ type (lost/found│
                                  │                 │ location        │
                                  │                 │ media           │
                                  │                 │ mediaType       │
                                  │                 │ isClaimed       │
                                  │                 │ status          │
                                  │                 │ createdAt       │
                                  │                 │ updatedAt       │
                                  │                 └─────────────────┘
                                  │                         ▲
                          ┌───────┴─────────┐               │
                          │     Comment     │               │
                          ├─────────────────┤               │
                          │ _id             │               │
                          │ text            │               │
                          │ item (ref)      │───────────────┘
                          │ commentedBy(ref)│
                          │ mentionedUsers[]│
                          │ parentComment   │──┐ (self-ref for replies)
                          │ isReply         │◄─┘
                          │ likes[]         │
                          │ isEdited        │
                          │ createdAt       │
                          │ updatedAt       │
                          └─────────────────┘
```

### Collections

#### Batch

| Field       | Type     | Description                    |
| ----------- | -------- | ------------------------------ |
| `_id`       | ObjectId | Primary key                    |
| `batchName` | String   | Batch name (e.g., "35-A")      |
| `status`    | String   | active / completed / cancelled |
| `createdAt` | Date     | Creation timestamp             |

#### Student

| Field            | Type     | Description              |
| ---------------- | -------- | ------------------------ |
| `_id`            | ObjectId | Primary key              |
| `name`           | String   | Student full name        |
| `email`          | String   | Unique email address     |
| `username`       | String   | Unique username          |
| `password`       | String   | Hashed password (bcrypt) |
| `phoneNumber`    | String   | Contact number           |
| `batchId`        | ObjectId | Reference to Batch       |
| `profilePicture` | String   | Profile image filename   |
| `createdAt`      | Date     | Registration timestamp   |

#### Category

| Field         | Type     | Description            |
| ------------- | -------- | ---------------------- |
| `_id`         | ObjectId | Primary key            |
| `name`        | String   | Category name (unique) |
| `description` | String   | Category description   |
| `status`      | String   | active / inactive      |
| `createdAt`   | Date     | Creation timestamp     |

#### Item

| Field         | Type     | Description                     |
| ------------- | -------- | ------------------------------- |
| `_id`         | ObjectId | Primary key                     |
| `itemName`    | String   | Name of lost/found item         |
| `description` | String   | Item description                |
| `type`        | String   | lost / found                    |
| `category`    | ObjectId | Reference to Category           |
| `location`    | String   | Where item was lost/found       |
| `media`       | String   | Photo/video filename            |
| `mediaType`   | String   | photo / video                   |
| `reportedBy`  | ObjectId | Reference to Student            |
| `claimedBy`   | ObjectId | Reference to Student (nullable) |
| `isClaimed`   | Boolean  | Claim status                    |
| `status`      | String   | available / claimed / resolved  |
| `createdAt`   | Date     | Creation timestamp              |
| `updatedAt`   | Date     | Last update timestamp           |

#### Comment

| Field            | Type       | Description                               |
| ---------------- | ---------- | ----------------------------------------- |
| `_id`            | ObjectId   | Primary key                               |
| `text`           | String     | Comment content                           |
| `item`           | ObjectId   | Reference to Item                         |
| `commentedBy`    | ObjectId   | Reference to Student                      |
| `mentionedUsers` | ObjectId[] | Tagged users (@username)                  |
| `parentComment`  | ObjectId   | Reference to parent Comment (for replies) |
| `isReply`        | Boolean    | Is this a reply?                          |
| `likes`          | ObjectId[] | Students who liked                        |
| `isEdited`       | Boolean    | Was comment edited?                       |
| `createdAt`      | Date       | Creation timestamp                        |
| `updatedAt`      | Date       | Last update timestamp                     |

---

## API Endpoints

**Base URL:** `http://localhost:3000/api/v1` (uses `PORT` from `config/config.env`, defaults to `5000` if not set)

## Flutter Integration (Quick Reference)

**Base URL**

`http://localhost:3000/api/v1`

**Signup (Register)**

- Method: `POST`
- Endpoint: `/students`
- Body:

```json
{
  "name": "Kiran Rana",
  "username": "kiranr",
  "email": "kiran@softwarica.edu.np",
  "password": "password123",
  "batchId": "64abc123...",
  "phoneNumber": "+977-9801234500",
  "profilePicture": "default-profile.png"
}
```

- Success (201):

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Kiran Rana",
    "email": "kiran@softwarica.edu.np",
    "username": "kiranr",
    "phoneNumber": "+977-9801234500",
    "batchId": "64abc123...",
    "profilePicture": "default-profile.png",
    "createdAt": "2025-12-20T10:00:00.000Z"
  }
}
```

- Error (400/404):

```json
{
  "message": "Email already exists"
}
```

**Login**

- Method: `POST`
- Endpoint: `/students/login`
- Body:

```json
{
  "email": "kiran@softwarica.edu.np",
  "password": "password123"
}
```

- Success (200):

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "64abc123...",
    "name": "Kiran Rana",
    "email": "kiran@softwarica.edu.np",
    "username": "kiranr",
    "phoneNumber": "+977-9801234500",
    "batchId": "64abc123...",
    "profilePicture": "default-profile.png",
    "createdAt": "2025-12-20T10:00:00.000Z"
  }
}
```

- Error (400/401):

```json
{
  "message": "Invalid credentials"
}
```

**Token Header Format**

```
Authorization: Bearer <token>
```

**Batch Lookup (get batchId)**

- Method: `GET`
- Endpoint: `/batches`
- Use: pick `data[i]._id` where `data[i].batchName` matches the batch (e.g., `35A`)

```json
{
  "success": true,
  "count": 4,
  "data": [
    { "_id": "65f0...abc", "batchName": "35A", "status": "active" },
    { "_id": "65f0...def", "batchName": "35B", "status": "active" },
    { "_id": "65f0...ghi", "batchName": "36A", "status": "active" },
    { "_id": "65f0...jkl", "batchName": "36B", "status": "active" }
  ]
}
```

### Authentication

Protected routes require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Batch Endpoints

| Method | Endpoint       | Description      | Auth |
| ------ | -------------- | ---------------- | ---- |
| POST   | `/batches`     | Create batch     | Yes  |
| GET    | `/batches`     | Get all batches  | No   |
| GET    | `/batches/:id` | Get single batch | No   |
| PUT    | `/batches/:id` | Update batch     | Yes  |

**Create Batch:**

```http
POST /api/v1/batches
Content-Type: application/json
Authorization: Bearer <token>

{
  "batchName": "35-A",
  "status": "active"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "batchName": "35-A",
    "status": "active",
    "createdAt": "2025-12-20T10:00:00.000Z"
  }
}
```

**Get All Batches (for batchId lookup):**

```http
GET /api/v1/batches
```

**Response:**

```json
{
  "success": true,
  "count": 4,
  "data": [
    { "_id": "65f0...abc", "batchName": "35A", "status": "active" },
    { "_id": "65f0...def", "batchName": "35B", "status": "active" },
    { "_id": "65f0...ghi", "batchName": "36A", "status": "active" },
    { "_id": "65f0...jkl", "batchName": "36B", "status": "active" }
  ]
}
```

---

### Category Endpoints

| Method | Endpoint          | Description         | Auth |
| ------ | ----------------- | ------------------- | ---- |
| POST   | `/categories`     | Create category     | Yes  |
| GET    | `/categories`     | Get all categories  | No   |
| GET    | `/categories/:id` | Get single category | No   |
| PUT    | `/categories/:id` | Update category     | Yes  |
| DELETE | `/categories/:id` | Delete category     | Yes  |

**Create Category:**

```http
POST /api/v1/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Electronics",
  "description": "Phones, laptops, chargers, earbuds, etc.",
  "status": "active"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Electronics",
    "description": "Phones, laptops, chargers, earbuds, etc.",
    "status": "active",
    "createdAt": "2025-12-20T10:00:00.000Z"
  }
}
```

---

### Student Endpoints

| Method | Endpoint           | Description            | Auth |
| ------ | ------------------ | ---------------------- | ---- |
| POST   | `/students`        | Register               | No   |
| POST   | `/students/login`  | Login                  | No   |
| GET    | `/students`        | Get all students       | Yes  |
| GET    | `/students/:id`    | Get single student     | No   |
| PUT    | `/students/:id`    | Update profile         | Yes  |
| DELETE | `/students/:id`    | Delete account         | Yes  |
| POST   | `/students/upload` | Upload profile picture | No   |

**Register (Signup):**

```http
POST /api/v1/students
Content-Type: application/json

{
  "name": "Kiran Rana",
  "username": "kiranr",
  "email": "kiran@softwarica.edu.np",
  "password": "password123",
  "batchId": "64abc123...",
  "phoneNumber": "+977-9801234500"
}
```

**Note:** `batchId` must be a valid MongoDB ObjectId from `GET /api/v1/batches`.

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Kiran Rana",
    "email": "kiran@softwarica.edu.np",
    "username": "kiranr",
    "phoneNumber": "+977-9801234500",
    "batchId": "64abc123...",
    "profilePicture": "default-profile.png",
    "createdAt": "2025-12-20T10:00:00.000Z"
  }
}
```

**Error Response (400/404):**

```json
{
  "message": "Email already exists"
}
```

**Login:**

```http
POST /api/v1/students/login
Content-Type: application/json

{
  "email": "kiran@softwarica.edu.np",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "64abc123...",
    "name": "Kiran Rana",
    "email": "kiran@softwarica.edu.np",
    "username": "kiranr",
    "phoneNumber": "+977-9801234500",
    "batchId": "64abc123...",
    "profilePicture": "default-profile.png",
    "createdAt": "2025-12-20T10:00:00.000Z"
  }
}
```

**Error Response (400/401):**

```json
{
  "message": "Invalid credentials"
}
```

---

### Item Endpoints

| Method | Endpoint              | Description     | Auth |
| ------ | --------------------- | --------------- | ---- |
| POST   | `/items`              | Create item     | Yes  |
| GET    | `/items`              | Get all items   | No   |
| GET    | `/items/:id`          | Get single item | No   |
| PUT    | `/items/:id`          | Update item     | Yes  |
| DELETE | `/items/:id`          | Delete item     | Yes  |
| POST   | `/items/upload-photo` | Upload photo    | Yes  |
| POST   | `/items/upload-video` | Upload video    | Yes  |

**Create Item:**

```http
POST /api/v1/items
Content-Type: application/json
Authorization: Bearer <token>

{
  "itemName": "Black Backpack",
  "description": "Lost near library, has keychain attached",
  "type": "lost",
  "category": "64abc456...",
  "location": "Library, Ground Floor",
  "media": "photo.jpg",
  "reportedBy": "64abc123..."
}
```

**Update Item (Mark as Claimed):**

```http
PUT /api/v1/items/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "claimed",
  "claimedBy": "64abc123...",
  "isClaimed": true
}
```

**Get Items with Pagination & Filters:**

```http
GET /api/v1/items?page=1&limit=10&type=lost&status=available&category=64abc456...
```

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [...]
}
```

---

### Comment Endpoints

| Method | Endpoint                        | Description             | Auth |
| ------ | ------------------------------- | ----------------------- | ---- |
| POST   | `/comments`                     | Create comment          | Yes  |
| GET    | `/comments/item/:itemId`        | Get comments by item    | No   |
| GET    | `/comments/:id/replies`         | Get replies             | No   |
| PUT    | `/comments/:id`                 | Update comment          | Yes  |
| DELETE | `/comments/:id`                 | Delete comment          | Yes  |
| POST   | `/comments/:id/like`            | Like/unlike comment     | Yes  |
| GET    | `/comments/student/:studentId`  | Get comments by student | No   |
| GET    | `/comments/mentions/:studentId` | Get mentions            | No   |

**Create Comment:**

```http
POST /api/v1/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "I think I saw this near the cafeteria @john",
  "itemId": "64abc123...",
  "commentedBy": "64abc456..."
}
```

**Create Reply:**

```http
POST /api/v1/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "Thanks for the info!",
  "itemId": "64abc123...",
  "commentedBy": "64abc456...",
  "parentCommentId": "64abc789..."
}
```

**Pagination:**

```http
GET /api/v1/comments/item/:itemId?page=1&limit=10&includeReplies=true
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
# Create config/config.env with:
# NODE_ENV=development
# PORT=3000
# LOCAL_DATABASE_URI=mongodb://127.0.0.1:27017/college_complaint
# JWT_SECRET=your_secret_key
# JWT_EXPIRE=30d

# Start server
npm run dev
```

---

## Seed Data

Populate the database with sample data for testing:

```bash
# Add seed data (batches, categories, students, items, comments)
node seed-data.js -i

# Delete all seed data
node seed-data.js -d
```

**Test Credentials (after seeding):**

| Email                           | Password    |
| ------------------------------- | ----------- |
| kiranrana@softwarica.edu.np     | password123 |
| sarah.johnson@softwarica.edu.np | password123 |
| michael.chen@softwarica.edu.np  | password123 |

All seeded accounts use password: `password123`

---

## Response Format

**Success (most endpoints):**

```json
{
  "success": true,
  "data": { ... }
}
```

**Success (login):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": { ... }
}
```

**Error (manual validation or auth):**

```json
{
  "message": "Error description"
}
```

**Error (middleware/validation):**

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Tech Stack

- Node.js
- Express.js v5
- MongoDB (Mongoose)
- JWT (Authentication)
- Multer (File Uploads)
- Helmet, XSS-Clean, Rate Limiting (Security)

---

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Rate limiting (100 requests/15min, 5 login attempts)
- XSS attack prevention
- NoSQL injection prevention
- CORS configuration
- Helmet security headers

---

**Author:** Kiran Rana

**License:** ISC
