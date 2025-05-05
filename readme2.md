# DS-Food-Delivery

---

## Prerequisites

Before starting, ensure the following tools are installed on your system:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- `openssl` (for generating RSA keys)
- `cp` or similar command-line utilities for copying files (Linux/macOS/WSL)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/SE-WE-22-Projects/DS-Food-Delivery/DS-Food-Delivery.git
cd DS-Food-Delivery
```

### 2. Generate RSA Private Key

The application requires an RSA private key named `service.priv.key` and a public key named `service.pub.key`.

Run the following commands to generate a 2048-bit RSA private key:

```bash
openssl genrsa -out service.priv.key 2048
openssl rsa -in service.priv.key -pubout > service.pub.key
```

> The key should be placed in the project root.

### 3. Configure Environment Variables

Copy the provided `.env.template` file to create your actual `.env` file:

```bash
cp .env.template .env
```

Then, edit `.env` to fill in the required values:

```bash
nano .env
```

Make sure all secrets, ports, and database credentials are correctly configured.

---

## Start the Project with Docker Compose

Use the following command to build and start all services:

```bash
docker-compose up --build
```

To run in detached mode:

```bash
docker-compose up -d --build
```

---

## Stopping the Services

To stop all containers:

```bash
docker-compose down
```
