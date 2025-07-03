# Ecommerce Demo App (Dockerized)

This is a minimal demo ecommerce application running in Docker containers.

## Features
- Product listing
- Shopping cart
- Basic checkout flow

## Tech Stack
- Frontend: React
- Backend: Node.js (Express)
- Database: SQLite

## Quick Start

```sh
docker-compose up --build
```

Frontend: http://localhost:3000  
Backend API: http://localhost:6000

---

## Directory Structure
- `frontend/` - React app
- `backend/` - Express API
- `db/` - SQLite database (data volume)
- `docker-compose.yml` - Orchestrates all services
