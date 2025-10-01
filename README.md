Read the Portuguese (Brazilian) version here: [README.pt-BR.md](https://github.com/kiLeo13/SimpleNotesWebsite/blob/master/README.pt-BR.md).

# ✨ OnnyC

OnnyC is a lightweight, high-performance web application designed to streamline note-taking and file management, inspired by the clean and responsive UI of ChatGPT.

-----

## ❓ The Problem

Traditional cloud storage services, while powerful, can become slow and cumbersome when dealing with deeply nested folder structures. This complexity often leads to a decrease in productivity when all you need is quick access to your notes and files.

## 💡 The Solution

OnnyC provides a simple, single-page application (SPA) where your notes are immediately accessible from a left-side navigation bar. This design eliminates the need to click through multiple folders, allowing you to create, view, and manage your content with exceptional speed. While initially built for internal company use to boost productivity, it's designed to be useful for anyone.

-----

## ⚙ Architecture Overview

The project is built on a modern, cloud-native architecture designed for scalability, security, and low cost, primarily leveraging AWS and Cloudflare services.

### Frontend

  * **Hosting:** The frontend is a Single-Page Application (SPA) hosted on **Cloudflare Pages**. This provides global content distribution through its CDN for faster access times, DDoS protection, and managed TLS/SSL.
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

1.  Clone the repository from GitHub.
2.  Build the Docker image:
    ```bash
    docker build -t onnyc .
    ```

> [!Note]
> Due to the project's deep integration with AWS services (Cognito, S3, SSM), it will not function correctly out-of-the-box in a local environment without extensive AWS configuration and credential setup.

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

### Backend

  * **Language:** **Golang**
  * **Framework & Libraries:**
      * [Echo v4](https://github.com/labstack/echo) - High-performance, extensible Go web framework.
      * [Gorm](https://github.com/go-gorm/gorm) - The fantastic ORM library for Go.
      * [AWS SDK for Go v2](https://github.com/aws/aws-sdk-go-v2) - Official AWS SDK for Go.
      * [go-playground/validator](https://github.com/go-playground/validator) - For struct validation.
      * [golang-jwt/jwt](https://github.com/golang-jwt/jwt) - For JWT parsing and validation.

### Frontend

> The frontend is currently being rewritten in React to improve maintainability and performance. The current version uses jQuery.

  * **Frameworks/Libraries:**
      * [jQuery](https://github.com/jquery/jquery)
      * [DOMPurify](https://github.com/cure53/dompurify) - XSS sanitizer for HTML.
      * [jwt-decode](https://github.com/auth0/jwt-decode) - For decoding JWTs on the client-side.
      * [Marked](https://github.com/markedjs/marked) - A markdown parser.
  * **Build Tools:**
      * [Vite](https://github.com/vitejs/vite)
      * [Terser](https://github.com/terser/terser)

### Database

  * **Database:** **SQLite** (mounted on a Docker volume for persistence).

### Containerization

  * **Tool:** **Docker**.

-----

## 🤔 Limitations & Security Notes

This project was designed to fit within free-tier cloud service limits. This has led to certain architectural decisions and limitations.

  * **API Security:** Communication between API Gateway and the EC2 instance is currently over HTTP, as a private VPC link is not used. To mitigate the risk of direct, unauthorized access to the EC2 IP, the API has a **middleware that performs a second layer of JWT validation** using the Cognito signature.
  * **Content Delivery Security:** A planned improvement is to secure CloudFront-served content. This will be implemented using a **Lambda@Edge** function to validate a user's Cognito token before serving a private file from S3.
  * **Authorization Tokens:** The application currently uses Cognito `id_token`s for authorization. This will be updated shortly to use properly scoped `access_token`s, in accordance with OAuth 2.0 best practices.
