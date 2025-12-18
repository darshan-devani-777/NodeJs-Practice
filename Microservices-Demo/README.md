# Microservices Demo - Run & Test Guide

## 🚀 Project ko Run Karne ke Tarike

### Method 1: Docker Compose se (Recommended)

Sabse aasan tarika - sab services ek saath start ho jayengi:

```bash
# Sabse pehle dependencies install karein (agar pehle se nahi hai)
cd user-service && npm install && cd ..
cd product-service && npm install && cd ..
cd api-gateway && npm install && cd ..

# Docker images build karein
docker-compose build

# Services start karein
docker-compose up

# Background me run karne ke liye
docker-compose up -d

# Services stop karne ke liye
docker-compose down
```

**Services ka Address:**
- API Gateway: http://localhost:8080
- User Service: http://localhost:3000
- Product Service: http://localhost:4000

---

### Method 2: Manually Har Service Ko Run Karein

#### Step 1: Dependencies Install Karein

```bash
# User Service
cd user-service
npm install

# Product Service (nayi terminal me)
cd product-service
npm install

# API Gateway (nayi terminal me)
cd api-gateway
npm install
```

#### Step 2: Services Start Karein

**Terminal 1 - User Service:**
```bash
cd user-service
npm start
# Service start ho jayega: http://localhost:3000
```

**Terminal 2 - Product Service:**
```bash
cd product-service
npm start
# Service start ho jayega: http://localhost:4000
```

**Terminal 3 - API Gateway:**
```bash
cd api-gateway
npm start
# Gateway start ho jayega: http://localhost:8080
```

---

## 🧪 API Endpoints Test Karne ke Tarike

### Quick Test Scripts (Sabse Aasan!)

**Option A: Bash Script (Linux/Mac)**
```bash
./test-api.sh
```

**Option B: Node.js Script**
```bash
node test-api.js
```

Yeh scripts automatically sab endpoints test kar dengi aur results dikhayengi!

---

### Manual Testing Options

### Option 1: cURL Commands se

#### User Service Endpoints:

```bash
# 1. User create karein
curl -X POST http://localhost:3000/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Rahul Sharma", "email": "rahul@example.com"}'

# 2. Sab users fetch karein
curl http://localhost:3000/fetch
```

#### Product Service Endpoints:

```bash
# 1. Product create karein (pehle user create karna zaroori hai)
curl -X POST http://localhost:4000/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 50000, "userId": 1}'

# 2. Sab products fetch karein
curl http://localhost:4000/fetch
```

#### API Gateway se (Recommended):

```bash
# 1. Health check
curl http://localhost:8080/health

# 2. User create (Gateway se)
curl -X POST http://localhost:8080/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Priya Patel", "email": "priya@example.com"}'

# 3. Users fetch (Gateway se)
curl http://localhost:8080/api/users/fetch

# 4. Product create (Gateway se)
curl -X POST http://localhost:8080/api/products/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Mobile Phone", "price": 25000, "userId": 1}'

# 5. Products fetch (Gateway se)
curl http://localhost:8080/api/products/fetch
```

---

### Option 2: Postman se Test Karein

1. **Postman install karein** (agar nahi hai)
2. **New Request create karein**

#### User Service Tests:

**POST Request - User Create:**
- Method: `POST`
- URL: `http://localhost:3000/create`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Amit Kumar",
  "email": "amit@example.com"
}
```

**GET Request - Fetch Users:**
- Method: `GET`
- URL: `http://localhost:3000/fetch`

#### Product Service Tests:

**POST Request - Product Create:**
- Method: `POST`
- URL: `http://localhost:4000/create`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Headphones",
  "price": 3000,
  "userId": 1
}
```

**GET Request - Fetch Products:**
- Method: `GET`
- URL: `http://localhost:4000/fetch`

#### API Gateway Tests:

**Health Check:**
- Method: `GET`
- URL: `http://localhost:8080/health`

**User Create via Gateway:**
- Method: `POST`
- URL: `http://localhost:8080/api/users/create`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "name": "Sneha Singh",
  "email": "sneha@example.com"
}
```

**Product Create via Gateway:**
- Method: `POST`
- URL: `http://localhost:8080/api/products/create`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "name": "Smart Watch",
  "price": 15000,
  "userId": 1
}
```

---

## 📋 Complete Test Flow (Step by Step)

### 1. Services Start Karein
```bash
# Docker se (sabse aasan)
docker-compose up
```

### 2. Pehle User Create Karein
```bash
curl -X POST http://localhost:8080/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully...",
  "data": {
    "id": 3,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### 3. Users Fetch Karein
```bash
curl http://localhost:8080/api/users/fetch
```

### 4. Product Create Karein (userId use karein jo step 2 me mila)
```bash
curl -X POST http://localhost:8080/api/products/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "price": 1000, "userId": 3}'
```

### 5. Products Fetch Karein
```bash
curl http://localhost:8080/api/products/fetch
```

---

## 🔍 Common Issues aur Solutions

### Issue 1: Port already in use
```bash
# Port check karein
lsof -i :3000
lsof -i :4000
lsof -i :8080

# Process kill karein agar zarurat ho
kill -9 <PID>
```

### Issue 2: Dependencies missing
```bash
# Har service me npm install karein
cd user-service && npm install
cd ../product-service && npm install
cd ../api-gateway && npm install
```

### Issue 3: Docker containers not starting
```bash
# Containers check karein
docker ps -a

# Logs dekhne ke liye
docker logs user_service
docker logs product_service
docker logs api_gateway

# Clean restart
docker-compose down
docker-compose build
docker-compose up
```

---

## 📝 Quick Reference

| Service | Port | Base URL |
|---------|------|----------|
| API Gateway | 8080 | http://localhost:8080 |
| User Service | 3000 | http://localhost:3000 |
| Product Service | 4000 | http://localhost:4000 |

### Endpoints Summary:

**User Service:**
- `POST /create` - User create
- `GET /fetch` - Users fetch

**Product Service:**
- `POST /create` - Product create
- `GET /fetch` - Products fetch

**API Gateway:**
- `GET /health` - Health check
- `POST /api/users/create` - User create (via gateway)
- `GET /api/users/fetch` - Users fetch (via gateway)
- `POST /api/products/create` - Product create (via gateway)
- `GET /api/products/fetch` - Products fetch (via gateway)

