## Prega Center – Backend

Node.js + Express + Sequelize + MySQL based backend for Prega Center.  
Server EJS views के साथ admin panel serve करता है और साथ ही REST APIs expose करता है (mobile/web app के लिए)।

---

## 1. Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Sequelize
- **Database**: MySQL
- **View Engine**: EJS
- **Auth / Security**:
  - JWT (`jsonwebtoken`)
  - Password hashing (`bcrypt`)
- **Others**:
  - File uploads (`multer`)
  - Mailing (`nodemailer`)
  - Cloud storage (`cloudinary`)
  - CORS, cookies, body parsing etc.

---

## 2. Folder Structure (High-level)

- `app.js` – main Express app (server entry)
- `core/core.js` – common helpers (password hash, email send, token generate)
- `models/` – Sequelize models + DB config
  - `dbconfig.js` – Sequelize initialization with env based config
- `controllers/` – business logic per module
- `routes/` – Express routers (users, articles, blog, baby names, coupons, groups, etc.)
- `middlewares/` – `verifyToken`, `optionalVerifyToken`, `multer` upload config
- `views/` – EJS admin pages (login, dashboard, articles, blogs, users, etc.)
- `public/` – static assets (AdminLTE, JS, CSS, images)
- `seeders/` – Sequelize seeders + JSON data (article topics, tags, baby names, group tags, post tags)
- `utils/` – `asyncHandler`, `cloudinary` setup
- `config/config.json` – Sequelize CLI environments (development/test/production)

---

## 3. Prerequisites

- Node.js (LTS)
- npm (या yarn)
- MySQL server (local या remote)
- Git (optional but recommended)

---

## 4. Environment Setup

### 4.1. Clone Repository

git clone https://gitlab.com/jay_tecocraft/prega-center-backend.git
cd prega-center-backend### 4.2. Install Dependencies

npm install
# या
yarn install### 4.3. `.env` Configure करें

Project root में `.env` फाइल बनाएँ (अगर पहले से नहीं है) और कम से कम ये keys सेट करें:

# Server
PORT=8181

# Database (used in models/dbconfig.js)
DATABASE_NAME=prega_center
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_DIALECT=mysql

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

# Email (used in core/core.js)
EMAIL_SERVICE=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your_email_password

# Cloudinary (if used in utils/cloudinary.js)
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx> Values अपने environment के हिसाब से बदलें।

---

## 5. Database Setup

### 5.1. Create Database

MySQL में DB create करें:

CREATE DATABASE prega_center CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;या जो भी नाम आपने `DATABASE_NAME` में दिया है वही use करें।

### 5.2. Sequelize Config (optional via CLI)

`config/config.json` में development config पहले से:

{
  "development": {
    "username": "root",
    "password": null,
    "database": "prega_center",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}आप चाहें तो password और database name यहाँ भी update कर सकते हैं अगर Sequelize CLI (`sequelize-cli`) से migrations/seeders चलानी हों।

### 5.3. Auto Sync

`models/dbconfig.js` में:

- `sequelize.sync({ force: false, alter: true })`  
  – app start होने पर models के हिसाब से tables sync हो जाते हैं (alter mode)।

---

## 6. Running the Project

### 6.1. Development Mode

npm run dev
# या
yarn dev- Script (`package.json`):
  - `"dev": "nodemon --ext js,json,ejs --watch routes --watch views --watch controllers -r dotenv/config --experimental-json-modules app.js"`
- Nodemon EJS views, routes और controllers को watch करेगा।

### 6.2. Production / Simple Start

npm start- Script (`package.json`):
  - `"start": "PORT=8181 node app.js"`
- `app.js` में:
  - `app.listen(process.env.PORT || 3000, ...)`  
  - Default: `PORT` env set है तो वही, वरना `3000`.

Server आम तौर पर `http://localhost:8181` पर चलाएंगे (जब `npm start` चलाते हैं)।

---

## 7. Main Application Flow

### 7.1. Entry (`app.js`)

- DB init: `require("./models/dbconfig");`
- CORS config:
  - Allowed origins:
    - `http://localhost:3000`
    - `http://localhost:3001`
    - `http://localhost:8181`
    - `http://192.168.29.45:8181`
    - `https://prega-center-web.netlify.app`
    - `https://pregacenter.tecocraft.us`
    - `http://192.168.29.45`
- Static + Views:
  - `public/` as static + `/public` path
  - Views path: `views/`, engine: `ejs`
- Parsers:
  - `express.json()`, `express.urlencoded({ extended: true })`, `cookieParser()`

### 7.2. Routes Mounted

- `app.use("/users", usersRouter);`
- `app.use("/likes", likesRouter);`
- `app.use("/articles", articlesRouter);`
- `app.use("/comments", commentsRouter);`
- `app.use("/courses", coursesRouter);`
- `app.use("/coupons", couponsRouter);`
- `app.use("/community", communityRouter);`
- `app.use("/purchases", purchasesRouter);`
- `app.use("/emailSubs", emailSubsRouter);`
- `app.use("/bookmarks", bookmarksRouter);`
- `app.use("/groups", groupsRouter);`
- `app.use("/faqs", faqsRouter);`
- `app.use("/feedbacks", feedbacksRouter);`
- `app.use("/tags", tagRouter);`
- `app.use("/posts", postRouter);`
- `app.use("/articleTopics", articleTopicsRouter);`
- `app.use("/articleTags", articleTagsRouter);`
- `app.use("/babyNames", babyNamesRouter);`
- `app.use("/blog", blogRouter);`
- `app.use("/subscriptions", subscriptionsRouter);`
- `app.use("/aboutUs", aboutUsRouter);`
- `app.use("/privacyPolicy", privacyPolicyRouter);`
- `app.use("/termsOfUse", termsOfUseRouter);`
- `app.use("/contact", contactRouter);`

### 7.3. Admin Home

- `GET "/"`:
  - अगर cookie `logged_in_user` है → redirect `/users/admin/dashboard`
  - वरना → `views/login.ejs` render

### 7.4. Error Handling

- Global error handler JSON response:
  - `{ error: err.message, success: false }`

---

## 8. Core Utilities (`core/core.js`)

- **Password Hashing**
  - `hashPassword(password)` → bcrypt with random salt rounds
- **Email**
  - `sendMail(mailData)` → uses `nodemailer` with env based SMTP
- **JWT Tokens**
  - `generateAccessAndRefreshToken(user)`:
    - `ACCESS_TOKEN_SECRET` + `ACCESS_TOKEN_EXPIRY`
    - `REFRESH_TOKEN_SECRET` + `REFRESH_TOKEN_EXPIRY`

---

## 9. Seed Data

`seeders/` directory में:

- JS seed files:
  - `20241226090924-create-admin.js`
  - `20250707120827-article-topics.js`
  - `20250709041640-article-tags.js`
  - `20250711094843-baby_names.js`
  - `20250807143615-group-tags.js`
  - `20250808043859-post-tags.js`
- JSON data:
  - `article_topics.json`, `articleTags.json`
  - `baby_names_*.json` (different regions/religions)
  - `group_tags.json`, `post_tags.json`

अगर आप `sequelize-cli` use करते हैं:

npx sequelize-cli db:seed:all(ध्यान दें: इसके लिए `config/config.json` properly सेट होना चाहिए।)

---

## 10. Scripts (from `package.json`)

- **Dev**: `npm run dev`
- **Start**: `npm start`

---

## 11. Typical Local Run – Step by Step

1. Repo clone करें  
2. `npm install` चलाएँ  
3. MySQL में database create करें  
4. `.env` सेट करें (DB, PORT, JWT, Email, Cloudinary)  
5. अगर जरूरत हो तो `sequelize-cli` से seeders run करें  
6. `npm run dev` (development) या `npm start` (production style)  
7. Browser में `http://localhost:8181` open करें (admin login page)  
8. Frontend / mobile app से ऊपर दिए हुए routes पर APIs hit करें

---

## 12. Notes / Future

- `models/dbconfig.js` अभी `sequelize.sync({ force: false, alter: true })` use कर रहा है – production में migrations strategy use करने की सलाह दी जाती है।
- CORS origin list में नई domains add करनी हों तो `app.js` में `cors` config update करें।
