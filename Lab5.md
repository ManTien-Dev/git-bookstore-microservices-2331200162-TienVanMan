**Software Engineering \- Lab 5: Microservices Architecture**

**Objective:** This assignment will introduce you to the fundamentals of designing and building applications using a microservices architecture. You will learn to containerize services, manage service-to-service communication, implement an API Gateway, and handle data persistence with separate databases for each service.

**Context:** We are building a simple "Online Bookstore" application. Instead of a single monolithic application, we will decompose the system into several small, independent services. Each service will be responsible for a specific business capability (e.g., managing products, handling orders). The entire system will be orchestrated using Docker Compose.

**Prerequisites**

·        **Docker, Docker Desktop and Docker Compose:** You must have Docker Desktop (or the equivalent for your OS) installed and running on your machine.  
·        **Understanding of REST APIs:** You should be comfortable with the concepts of RESTful API design (GET, POST, etc.).  
·        **Node.js:** All services are written in JavaScript, so a good understanding is required.

**Learning resources**

To help you do the assignment smoothly, please watch this video first: [Docker in 100 seconds](https://www.youtube.com/watch?v=Gjnup-PuquQ)

**Submission**

1\.     Submit the GitHub link to your project:  
https\://github.com/**\<your-username\>**/git-bookstore-microservices-**\<StudentID\>**\-**\<YourName\>**  
   
2\.     A single ZIP file that:

* Includes a screenshot of all running services displayed in Docker Desktop.  
  * Includes a screenshot of the web application's main page where you have successfully logged in at [http\://localhost:8000](http://localhost:8000).  
  * Includes a screenshot of the web application's main page where you have successfully created a product at [http\://localhost:8000](http://localhost:8000).  
  * Includes a screenshot of the web application's main page where you have successfully created an order at [http\://localhost:8000](http://localhost:8000).  
  * Includes a screenshot of your terminal showing the logs from docker-compose up where the order-service successfully publishes an event at RabbitMQ Management [http\://localhost:15672](http://localhost:15672).

**Before Starting: Project Setup with Git Submodules**

**Project Setup Using Git Submodules**

This lab uses **Git submodules** to manage multiple microservices as independent repositories.

Each microservice (e.g., product-service, user-service) is maintained as its **own Git repository**, while the parent repository is responsible for:

* Docker Compose orchestration  
* Environment configuration  
* System startup

**Step 1: Fork the Parent Repository**

Fork the following repository to your own GitHub account:

git@github.com:khiemnguyen-eiu/bookstore-microservices.git

 

**Step 2: Clone the Repository with Submodules**

After forking, clone **your fork** using the following command:

git clone \--recurse-submodules git@github.com:**\<your-username\>**/bookstore-microservices.git

cd bookstore-microservices

 

**Important**:  
 The \--recurse-submodules flag is required. Without it, the microservice folders will be empty.

If you forgot this flag, run:

git submodule update \--init \--recursive

 

**Part 1: System Orchestration with Docker Compose**

The docker-compose.yml file is the blueprint for our entire microservices application. It defines all the services, databases, and networks needed to run the system.

1\.     **Examine the Project Structure:** Notice how the project is divided into separate folders for each service (api-gateway, product-service, etc.). Each service has its own Dockerfile.  
2\.     **Implement docker-compose.yml:** Open the docker-compose.yml file. Following the TODO comments, you need to define all the services and dependencies:  
o   The frontend, api-gateway, product-service, user-service, and order-service.  
o   A PostgreSQL database for the product-service and another one for the order-service.  
o   A MongoDB database for the user-service.  
o   A RabbitMQ message broker for asynchronous communication.  
o   Define dependencies using depends\_on so that services start in the correct order.  
3\.               **Build and Run the System:** Once your docker-compose.yml is complete, you can build and run the entire application stack from the root bookstore-microservices directory.  
 docker-compose up \--build

 This command will build the Docker image for each service and start all the containers. You will see logs from all services interleaved in your terminal. At this point, the services will start but won't be fully functional until you implement their logic.

**Part 2: Implementing RESTful Microservices**

Each service needs to expose a RESTful API to be consumed by other services or the frontend.

1\.     **Implement the product-service:** Open product-service/index.js. Complete the two REST endpoints:  
o   GET /products: Should query its PostgreSQL database and return a list of all books.  
o   GET /products/:id: Should return the details of a single book.  
2\.        **Implement the user-service:** Open user-service/index.js. Complete the REST endpoint:  
o   POST /users/register: Should take a username and password, hash the password, and save the new user to its MongoDB database.  
3\.               **Restart Containers:** After implementing a service, you must rebuild it for the changes to take effect.  
 docker-compose up \--build \-d product-service user-service  
 \# The \-d flag runs it in detached mode

 You can use tools like Postman or curl to test your endpoints directly (e.g., curl http\://localhost:8002/products).

**Part 3: The API Gateway**

The API Gateway is the single entry point for all client requests. It simplifies the client by routing requests to the appropriate downstream service.

1\.     **Implement the api-gateway:** Open api-gateway/index.js. Your task is to implement the routing logic.  
o   Requests starting with /api/users should be proxied to the user-service.  
o   Requests starting with /api/products should be proxied to the product-service.  
o   Requests starting with /api/orders should be proxied to the order-service.  
o   All other requests (/) should be proxied to the frontend service.  
2\.        **Test the Gateway:** Rebuild the gateway (docker-compose up \--build \-d api-gateway). Now, you should be able to access the entire application through the gateway's port (port 8000).  
o   Visiting http\://localhost:8000 should show the web frontend.  
o   Making a GET request to http\://localhost:8000/api/products should return the list of books from the product-service.

**Part 4: RESTful & Asynchronous Communication**

This part involves more complex interactions, including event-driven communication and handling service failures.

1\.     **Implement the order-service:** Open order-service/index.js. This is the most complex service.  
o   **REST Endpoint:** Implement the POST /orders endpoint. It should save a new order to its database.  
o   **Asynchronous Event:** After saving an order, it should publish a message (e.g., { "event": "ORDER\_CREATED", "orderId": ... }) to the RabbitMQ message broker. This allows other services to react to new orders without being tightly coupled.  
2\.               **Test the Full Flow:** Rebuild the order-service. Use the web application at http\://localhost:8000 to create an order.  
o   You should see the order get created.  
o   In the Docker logs, you should see a log from the order-service indicating that a message was published to RabbitMQ.  
 

 

**Submission Guide**

Before submitting, use the provided **clean\_and\_push.py** Python script to remove Git submodule metadata and push your project to the required submission repository. This script deletes **.gitmodules** and every **.git** folder under the project (so the submission is one single Git repo, not submodules), then initializes a new repo, commits all files, and pushes to your submission URL.

 

**Create the submission repository on GitHub**

Create a new repository with this exact name format:

git-bookstore-microservices-**\<StudentID\>**\-**\<YourName\>**

Example: git-bookstore-microservices-000875-NguyenTienTuanKhiem

 

**Run the script from the project root**

Open a terminal in the bookstore-microservices folder (or its parent) and run:

python clean\_and\_push.py \--repo git@github.com:**\<your-username\>**/git-bookstore-microservices-**\<StudentID\>**\-**\<YourName\>**.git

 

For HTTPS instead of SSH:

python clean\_and\_push.py \--repo https\://github.com/**\<your-username\>**/git-bookstore-microservices-**\<StudentID\>**\-**\<YourName\>**.git

 

**Complete your submission**

Submit the GitHub link:

https\://github.com/**\<your-username\>**/git-bookstore-microservices-**\<StudentID\>**\-**\<YourName\>**

 

Submit the ZIP file containing the required screenshots (Docker Desktop, logged-in main page, product created, order created, and terminal logs showing the order-service publishing to RabbitMQ).

 

 

 

**Grading Rubric**

| Part | Criteria | Points |
| ----- | :---- | ----- |
| **1\. Project Setup & Repo** | Public GitHub repository created and named exactly: git-bookstore-microservices-\<StudentID\>\-\<FullName\>. | 10 |
| **Subtotal** |  | **10** |
| **2\. Docker Compose Orchestration** | **Service Definitions** Frontend service defined and builds successfully (3 points) API Gateway service defined and builds successfully (3 points) Product service defined and builds successfully (3 points) User service defined and builds successfully (3 points) Order service defined and builds successfully (3 points) | 15 |
|  | **Infrastructure Services** PostgreSQL for product-service configured correctly (2 points) PostgreSQL for order-service configured correctly (2 points) MongoDB for user-service configured correctly (2 points) RabbitMQ broker configured and running (2 points) | 8 |
|  | **Orchestration Quality** Correct use of depends\_on for startup order (1 point) All services run successfully with docker-compose up \--build (1 point)   | 2 |
| **Subtotal** |  | **25** |
| **3\. RESTful Microservices Implementation** | **Product Service** GET /products implemented and returns all books from PostgreSQL (5 points) GET /products/:id implemented and returns correct book data (5 points) | 10 |
|  | **User Service** POST /users/register endpoint implemented (4 points) Password hashing correctly applied before storage (3 points) User successfully persisted in MongoDB (3 points) | 10 |
| **Subtotal** |  | **20** |
| **4\. API Gateway Implementation** | /api/users correctly proxied to user-service. | 4 |
|  | /api/products correctly proxied to product-service. | 4 |
|  | /api/orders correctly proxied to order-service. | 4 |
|  | Root (/) requests proxied to frontend service. | 3 |
| **Subtotal** |  | **15** |
| **5\. Order Service & Asynchronous Messaging** | `POST /orders` endpoint implemented. | 4 |
|  | Order successfully saved to database. | 3 |
|  | Event published to RabbitMQ after order creation. | 4 |
|  | Event format is valid and meaningful. | 2 |
|  | Successful publish visible in logs or RabbitMQ UI. | 2 |
| **Subtotal** |  | **15** |
| **6\. Required Evidence & Screenshots** | Screenshot of Docker Desktop showing all services running | 2 |
|  | Screenshot of successful login at http\://localhost:8000 | 2 |
|  | Screenshot of successful product creation | 2 |
|  | Screenshot of successful order creation | 2 |
|  | Screenshot/log evidence of order event published to RabbitMQ | 2 |
| **Subtotal** |  | 10 |
| **7\. Submission Quality & Packaging** | ZIP file complete and correctly submitted. | 2 |
|  | Screenshots clear, readable, and relevant. | 2 |
|  | Naming conventions followed and files organized. | 1 |
| **Subtotal** |  | **5** |
| **TOTAL** |  | **100** |

 

   
Good luck\!  
 

