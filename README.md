# File Sharing and Authentication API

A robust backend service built with Node.js and Express that handles secure user authentication (including JWT and Refresh Tokens) and file uploading/sharing features.

---

## 🚀 Features

- **Secure Authentication:** Access token via JSON response and Refresh Token via HTTP-only cookies (using `cookie-parser`).
- **OAuth / Advanced Auth:** Integration via `arctic`.
- **File Management:** File upload functionality utilizing `multer` with `uuid` generation.
- **Email Sharing:** Share uploaded file links directly via email using `nodemailer` / `resend`.
- **Automated Cleanup:** Scheduled background tasks handled via `node-cron` (e.g., deleting expired files).
- **Route Protection:** Middleware implementation to protect sensitive endpoints using Bearer Tokens.

---

## 🔒 Authentication Note

All protected routes require an authorization header structured as a Bearer Token:

```
Authorization: Bearer <your_access_token>
```

---

## 📋 API Reference

### 1. User & Authentication Routes (`/api/auth` or `/api/user`)

---

#### 🔹 User Login

- **URL:** `/login`
- **Method:** `GET`
- **Access:** Public

**Success Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Logged in successfully",
  "success": true
}
```

> 💡 **Note:** A `refreshToken` is also set in the browser/client as an HTTP-only cookie.

---

#### 🔹 Google OAuth Callback

- **URL:** `/login/google/callback`
- **Method:** `GET`
- **Access:** Public

---

#### 🔹 Refresh Access Token

- **URL:** `/refresh-token`
- **Method:** `POST`
- **Access:** Public (Requires valid Refresh Token HTTP cookie)

**Success Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully",
  "success": true
}
```

---

#### 🔹 User Logout

- **URL:** `/logout`
- **Method:** `POST`
- **Access:** Public

---

#### 🔹 Check Authentication Status

- **URL:** `/check`
- **Method:** `GET`
- **Access:** 🔒 Private (Requires Bearer Token)

**Success Response (200 OK):** `you are logined`

---

### 2. File Routes (`/api/files`)

---

#### 🔹 Base Route Check

- **URL:** `/`
- **Method:** `GET`
- **Access:** Public

**Success Response (200 OK):** `API is running`

---

#### 🔹 Upload a File

- **URL:** `/`
- **Method:** `POST`
- **Access:** 🔒 Private (Requires Bearer Token)
- **Content-Type:** `multipart/form-data`

**Body Form Data:**

| Key | Value |
|-----|-------|
| `myfile` | `[File Binary]` *(The key field name must be exactly `myfile`)* |

**Success Response (201 Created):**

```json
{
  "statusCode": 201,
  "data": {
    "file": {
      "filename": "1781867893644-878296670.jpg",
      "path": "uploads/1781867893644-878296670.jpg",
      "size": 103804,
      "uuid": "751d6f63-a89f-480c-b153-1d27fd3c75fe",
      "_id": "6a3525755ddada82ae9b8ae2",
      "expiresAt": "2026-06-20T11:18:13.661Z",
      "createdAt": "2026-06-19T11:18:13.662Z",
      "updatedAt": "2026-06-19T11:18:13.662Z",
      "__v": 0
    },
    "url": "http://localhost:3000/api/files/751d6f63-a89f-480c-b153-1d27fd3c75fe"
  },
  "message": "Success",
  "success": true
}
```

---

#### 🔹 Download / View File Details

- **URL:** `/download/:uuid`
- **Method:** `GET`
- **Access:** 🔒 Private (Requires Bearer Token)

---

#### 🔹 Send File Link via Email

- **URL:** `/send`
- **Method:** `POST`
- **Access:** 🔒 Private (Requires Bearer Token)
- **Content-Type:** `application/json`

**Request Body Example:**

```json
{
  "emailTo": "tskpriyanshu2005@gmail.com",
  "uuid": "751d6f63-a89f-480c-b153-1d27fd3c75fe"
}
```

**Success Response (201 Created):**

```json
{
  "statusCode": 201,
  "data": "email send successfully",
  "message": "Success",
  "success": true
}
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js installed on your machine
- MongoDB instance setup (Local or Atlas)

### Installation Steps

**1. Clone the repository:**

```bash
git clone <your-repository-url>
cd <repository-folder>
```

**2. Install dependencies:**

```bash
npm install
```

**3. Set up Environment Variables:**

Create a `.env` file in the root directory and configure your keys:

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
RESEND_API_KEY=your_resend_api_key
APP_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK=http://localhost:3000/api/auth/login/google/callback
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

**4. Run the Application:**

For development (with live reload via nodemon):

```bash
npm run dev
```

For production:

```bash
npm run serve
```
