
# Ticket Management System (CPS630 Project)

## Overview

This project is a web-based ticket management system designed to simulate a professional Enterprise Service Management Tool (ESMT). The goal of the application is to allow users to submit support tickets and enable agents to manage, resolve, and communicate through those tickets in a structured environment.

The system includes two primary roles.

### Users
Users can register and log in to the system. Once authenticated, they are able to create support tickets, view their previously submitted tickets, and communicate with agents through ticket messages. Each ticket is securely associated with the user who created it.

### Agents
Agents log in through a separate authentication portal. They can view all submitted tickets, respond to users, update ticket statuses (Open / Resolved), and add notes to help resolve issues.

### Technical Concept

The application follows a full‑stack architecture consisting of:

Frontend  
React + Vite for building dynamic user interfaces and multiple application views.

Backend  
Node.js with Express to provide REST API endpoints that handle CRUD operations.

Database  
MongoDB with Mongoose for storing users, agents, and ticket information.

Originally, the system used JSON files to store application data. The project was later migrated to MongoDB, allowing the system to support scalable and persistent data storage. A seed script synchronizes JSON dummy data into MongoDB for testing and development.

### Future Extensions

The system could be expanded with several additional features:

- Ticket priority levels and SLA tracking
- Agent assignment system
- Real‑time notifications using WebSockets
- Analytics dashboards for ticket statistics
- File attachments within tickets
- Role‑based access control and audit logging

With these enhancements, the application could evolve into a fully functional enterprise helpdesk platform.

---

# Documentation

## Project Structure

The project is divided into Three main components.

### Backend (Node.js / Express)
Handles API routes, authentication, MongoDB integration, and ticket management.

### Frontend (React + Vite)
Provides the user interface for users and agents to interact with the system.

### Database
MongoDB stores collections for users, agents, and tickets.

---

## Running the Project

### 1. Start MongoDB

Ensure MongoDB is running locally.

Database URL:

```
mongodb://localhost:27017/407
```

### 2. Run the Backend Server

Navigate to the backend folder:

```
cd backend
```

Install dependencies:

```
npm install
```

Start the server:

```
npm run start
```

The backend server runs on:

```
http://localhost:8080
```

---

### 3. Run the Frontend Application

Navigate to the frontend folder:

```
cd frontend
```

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

The frontend runs on:

```
http://localhost:5173
```

---

## Using the Application

### User Portal

Users can:

- Sign up for an account
- Log in securely
- Create support tickets
- View submitted tickets
- Send messages within a ticket
- Delete tickets they created

### Agent Portal

Agents can:

- Log in through the agent login page
- View all system tickets
- Respond to user messages
- Change ticket status (Open / Resolved)
- Manage ongoing support issues

---

## REST API Operations

The backend provides REST endpoints that perform CRUD operations.

CREATE  
Create new users and tickets

READ  
Retrieve tickets and user data

UPDATE  
Update ticket messages and ticket status

DELETE  
Allow users to delete their tickets

These endpoints allow the frontend to communicate with the backend through HTTP requests.

---

# Reflection

This project focused on building a full‑stack web application that simulates a real‑world support ticketing system. The main goal was to integrate frontend development, backend API design, and database management into one functional system.

One of the most significant aspects of the project was migrating the application from JSON‑based storage to MongoDB. Initially, user accounts and ticket data were stored inside JSON files. While this worked for early testing, it was not scalable or suitable for a production‑like environment.

By migrating the system to MongoDB using Mongoose, the project gained several advantages:

- Persistent data storage
- Structured schema models
- Improved scalability
- Secure user association with tickets

Another important success was implementing role‑based workflows. The application separates users and agents into different interfaces. Users interact with the system by submitting tickets, while agents manage and resolve those tickets. This design closely mirrors how real enterprise service desks operate.

### Challenges

One of the main challenges encountered during development was handling authentication and ensuring that users could only access their own tickets. Implementing proper authorization logic required careful design of API routes and database queries.

Another challenge was migrating data from JSON files into MongoDB while preserving existing records. This was solved by creating a seed script that reads JSON data and inserts or updates records in MongoDB using upsert operations.

### Successes

The final system successfully integrates:

- React frontend views
- Express REST API backend
- MongoDB database
- Authentication for both users and agents
- Full CRUD functionality for ticket management

Overall, the project demonstrates how a basic prototype can evolve into a scalable application through database integration, structured APIs, and modular frontend design.
