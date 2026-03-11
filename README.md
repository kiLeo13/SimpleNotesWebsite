<img align="right" src="https://github.com/kiLeo13/SimpleNotesWebsite/blob/master/public/favicon.png?raw=true" height="100" width="100">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/kiLeo13/SimpleNotesWebsite/blob/master/LICENSE)

# ✨ ZenKeep

ZenKeep is a lightweight, high-performance web application designed to streamline note-taking and file management, inspired by the interface of ChatGPT.

-----

## ❓ The Problem

Traditional cloud storage services, while powerful, can become slow when dealing with deeply nested folder structures. This complexity often leads to a decrease in productivity when all you need is quick access to your notes and files.

## 💡 The Solution

ZenKeep provides a simple SPA where your notes are immediately accessible from a left-side navigation bar. This design eliminates the need to click through multiple folders, allowing you to create, view, and manage your content easily. While initially built for internal company use to boost productivity, it's designed to be useful for anyone.

-----

## ⚙ Architecture Overview

The project is built on a cloud-native architecture, primarily leveraging AWS and Cloudflare services.

### Frontend

  * **Hosting:** The frontend is a **React + TypeScript** Single-Page Application hosted on **Cloudflare Pages**. This provides global content distribution through its CDN for faster access times, DDoS protection, and managed TLS/SSL.
  * **Deployment:** A CI/CD workflow is automatically triggered by Cloudflare whenever code is pushed to the `master` branch on GitHub.

### Backend

  * **Compute:** The API backend is a multitenant application written in **Golang** and runs inside a Docker container on an **AWS EC2** instance.
  * **API Gateway & Security:** **AWS API Gateway** acts as a reverse proxy. It handles TLS termination (HTTPS), manages authorization and rate-limiting, and securely routes requests to the EC2 instance.
  * **Authentication:** User authentication is fully managed by **AWS Cognito**, which handles user sign-up, password hashing, email verification, and the generation/validation of JWTs.
  * **File Storage:** All user-uploaded images and files are stored securely in an **AWS S3** bucket and served globally via the **AWS CloudFront** CDN for low-latency access.
  * **Secrets Management:** All sensitive credentials, such as API keys and database connection details, are securely stored and encrypted using **AWS Systems Manager (SSM) Parameter Store**.

-----

## 🖥 How To Run & Deploy

### Local Setup

#### Backend (Docker)

1.  Clone the repository from GitHub.
2.  Build the Docker image:
    ```bash
    docker build -t zenkeep .
    ```

> [!Note]
> Due to the project's deep integration with AWS services (Cognito, S3, SSM), it will not function correctly out-of-the-box in a local environment without extensive AWS configuration and credential setup.

#### Frontend (React)

1. Navigate to the frontend's directory.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run the local development server:
    ```bash
    npm run dev
    ```

### Deployment

The backend deployment is automated using **Docker** and **WatchTower**.

1.  The Golang application is built and pushed as a Docker image to GitHub Container Registry.
2.  A WatchTower instance running on the EC2 server polls the registry every 5 minutes.
3.  If a new image is detected, WatchTower automatically pulls the new version and restarts the container with the updated code.

-----

## 🔬 Technology Stack

### Cloud & AWS Services

* **Compute:** AWS EC2
* **Storage:** AWS S3
* **CDN:** AWS CloudFront, Cloudflare Pages
* **Networking & API:** AWS API Gateway
* **Security & Identity:** AWS Cognito, AWS IAM
* **Configuration & Secrets:** AWS SSM Parameter Store

### Database

* **Database:** **SQLite** (mounted on a Docker bind mount for persistence).

### Containerization

* **Tool:** **Docker**.

-----

## 🤔 Limitations & Security Notes

This project was designed to fit within free-tier cloud service limits. This has led to certain architectural decisions and limitations.

  * **API Security:** Communication between API Gateway and the EC2 instance is currently over HTTP, as a private VPC link is not used. To mitigate the risk of direct, unauthorized access to the EC2 IP, the API has a **middleware that performs a second layer of JWT validation** using the Cognito signature.
  * **Content Delivery Security:** A planned improvement is to secure CloudFront-served content. This will be implemented using a **Lambda@Edge** function to validate a user's Cognito token before serving a private file from S3.
  * **Authorization Tokens:** The application currently uses Cognito `id_token`s for authorization. This will be updated shortly to use properly scoped `access_token`s, in accordance with OAuth 2.0 best practices.
