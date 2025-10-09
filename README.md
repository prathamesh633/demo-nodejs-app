🚀 Demo Node.js + MySQL Project (Dockerized Setup)
🧠 Overview

This project demonstrates a simple Node.js frontend connected to a MySQL database, all containerized using Docker Compose.
It allows you to run both services in a single network and verify their connection through a browser or Postman.

⚙️ System Requirements
💻 Minimum Hardware

CPU: 1 Core

RAM: 1 GiB

Storage: 10 GiB

☁️ Recommended Setup

AWS EC2 Instance: t2.micro

🧰 Software Requirements

Operating System: Ubuntu 22.04 / 24.04

Packages:

Docker

Docker Compose

Docker Hub (for pulling images)

🧾 Installation & Setup Guide
1️⃣ Install Docker

Follow the official Docker installation guide for Ubuntu:
👉 Install Docker on Ubuntu

2️⃣ Install Docker Compose

If not installed, follow this guide:
👉 Install Docker Compose on Ubuntu

3️⃣ Create Project Directory
mkdir project
cd project

4️⃣ Clone the Project Repository
git clone https://github.com/prathamesh633/demo-nodejs-app.git

5️⃣ Add a docker-compose.yml File

Inside the project folder, create a docker-compose.yml file to define and run the containers.

6️⃣ Run the Containers

Start the project using Docker Compose:

docker compose up -d

7️⃣ Verify Running Containers

Check if both frontend and database containers are running:

docker ps

8️⃣ Access the Frontend Container

Enter the frontend container (replace <container_id> accordingly):

docker exec -it <container_id> bash

9️⃣ Test Container Connectivity

Inside the frontend container, run:

ping <db_container_name_or_id>


If you receive ping responses ✅, your frontend is connected to the database.

🔗 Verify Application in Browser

Local Setup: http://localhost:3000

Cloud Server: http://<public-ip>:3000

🧩 Test Functionality

Open the web UI.

Fill in and submit form data.

Click “View All Users (JSON)” to verify if the information is saved successfully in the database.

🎉 Success!

You’ve now successfully:

Deployed the Node.js app and MySQL database using Docker Compose

Verified container communication

Tested full frontend–backend connectivity
