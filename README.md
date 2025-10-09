# 🚀 Demo Node.js + MySQL Project (Dockerized Setup)

## 🧠 Overview
This project demonstrates a simple **Node.js frontend** connected to a **MySQL database**, all containerized using **Docker Compose**.  
You can easily run both services in a single network and verify their connection through a **browser** or **Postman**.

---

## ⚙️ System Requirements

### 💻 Minimum Hardware
| Resource | Specification |
|-----------|----------------|
| **CPU**   | 1 Core |
| **RAM**   | 1 GiB |
| **Storage** | 10 GiB |

### ☁️ Recommended Environment
- 🟢 **AWS EC2 Instance:** `t2.micro`

### 🧰 Software Requirements
| Component | Version / Notes |
|------------|----------------|
| **OS** | Ubuntu 22.04 / 24.04 |
| **Docker** | Latest |
| **Docker Compose** | Latest |
| **Docker Hub** | Required for pulling images |

---

## 🧾 Installation & Setup Guide

### 🪄 1️⃣ Install Docker
Follow the official Docker documentation:  
👉 [**Install Docker on Ubuntu**](https://docs.docker.com/engine/install/ubuntu/)

---

### ⚙️ 2️⃣ Install Docker Compose
If not installed already:  
👉 [**Install Docker Compose on Ubuntu**](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)

---

### 📁 3️⃣ Create Project Directory
```bash
mkdir project
cd project
```
---

### 📥 4️⃣ Clone the Project Repository
```bash
git clone https://github.com/prathamesh633/demo-nodejs-app.git
```
---

### 🚀 6️⃣ Run the Containers
```bash
docker compose up -d
```

✅ This command will build and start all containers in detached mode.


---

### 🧰 7️⃣ Verify Running Containers
```bash
docker ps
```

🔍 You should see your Node.js frontend and MySQL database containers listed.

---

### 🐚 8️⃣ Access the Frontend Container
Replace <container_id> with the actual container ID from docker ps:
```bash
docker exec -it <container_id> bash
```
---

### 🔗 9️⃣ Test Container Connectivity

Inside the frontend container:
```bash
ping <db_container_name_or_id>
```
✅ If you receive replies, your frontend is successfully connected to the database.

---

### 🌐 Access the Application
Local environment	URL
```bash
Local Setup	http://localhost:3000
```

Cloud Server
```bash
http://<public-ip>:3000
```
---
### 🧩 Test Functionality

Open the application in your browser.

Fill in the form and submit data.

Click “View All Users (JSON)” to confirm that your data is being saved to the MySQL database.

---
### 🎉 Success!

  You’ve successfully:

    ✅ Deployed the Node.js frontend and MySQL containers using Docker Compose

    ✅ Verified container connectivity
    
    ✅ Tested the full end-to-end data flow between the frontend and database
    
---