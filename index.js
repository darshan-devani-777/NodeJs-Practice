// NODE CORE-CONCEPTS
// 1. Event-driven architecture - Handle Multiple Requests Con-currently
                            //  - Trigger Event Emitter 
// 2. Asynchronous Programming - Callbacks / Promises / Async-Await
                            // - Handle Non-Blocking Operation
// 3. Modules - Reusable Units / Import method 
// 4. NPM - (Node Package Manager) - Vast Ecosystem / Libraries and tools
// 5. Core Modules - Http , Https - Handling HTTP requests
                //  Fs - Interact File System
                //  Path - Manipulate file paths
                //  Events - Event driven programming
// 6. Single threded - Rus on single thread
// 7. Error Handling - Try-catch block
// 8. Streams - Data Handling Process / Large File
// 9. Buffers - Store Binary Data 

// Node.js - Privide Runtime Environment
        // - Execute Javascript server-side
    
// Event Loop - Perform Non-blocking I/O Operation
            // - Monitor events / Executes Callbacks
            // - Handle Multiple Con-Current requests
            
// Non-Blocking I/O - Handle Multiple Connection Requests            
             // - Non-Blocking Manner
             
// PATH-MODULE :- Working with File / Directory Paths
// FS-MODULE :- (File System) - Work with File (Read , Write , Delete , Append)
// OS-MODULE:- (Operating system) - Provide OS related properties
// HTTP-MODULE :- Creating Web-Servers / Handling HTTP Request Response             

// NPM :- (Node Package Manager)
     // - Install , Update / manage project Dependencies , Scripts , Third-party libraries

// Dependency / DevDependency / PeerDependency
// DEPENDENCY :- Used in Production / Run App
// DEVDEPENDENCY :- Used in Developement / Testing , Build Tools
// PEERDEPENDENCY :- Used in Production / Install manually / Build Library

// CALLBACK HELL :- Multiple Nested Callbacks Used in Asynchronously
               // - File Reading , Database Queries , API Calls

// AVOID CALLBACK HELL :- 1. Named Functions - Define Separate named function
                       // 2. Promises - Avoiding Deep Nesting
                       // 3. Async / Await - Looks Synchronous  / Readable
                       
// TYPESCRIPT :- Super-set of javascript
            // - Static Typing
            // - Catch error during Compile time
            
// BASIC TYPES :- String , Number , Boolean , Any , Unknown
// Any :- Hold any type of value
// Unknown :- Type Unknown / Avoid Run-Time Error            

// ARRAYS / TUPLES / ENUMS
// ARRAYS :- Stored elements same Datatype
         // Example: [1, "hello", true]

// TUPLES :- Stored Fix size elements
        // - Each element have different type
        // Example: [string, number, boolean]

// ENUMS (Ennumerations):- Enhance Readability / Type Safety
        // Example: enum Direction { Up, Down, Left, Right }

// TYPE INFERENCE / UNION / INTERSECTION TYPES
// TYPE INFERENCE :- Deteremine Variables based on Value
             // let message = "Hello, TypeScript!"; // `string`
             // let num = 42; // `number`
             // let isActive = true; // `boolean`
             
// UNION TYPES :- Variables to hold values multiple types
             // - Handling User Input
             // let value: string | number;
             // value = "Hello"; // Valid
             // value = 100; // Valid
             // value = true; // InValid       

// INTERSECTION TYPES :- Combine Multiple types into One
             //  - Combining User Details
             // type Person = { name: string; age: number };
        //      interface Person {
        //         name: string;
        //     }
        
        //     interface Employee {
        //         id: number;
        //     }
        
        //     type EmployeeDetails = Person & Employee; 
        
        //     const employee: EmployeeDetails = {
        //         name: "Alice", 
        //         id: 123, 
        //     };

// FUNCTION (PARAMETER TYPES / RETURN TYPES)
// PARAMETER TYPES :-  Specify type parameter
                  // - Type safety and clarity
// function greet(name: string, age: number): string {
//   return `Hello, my name is ${name} and I am ${age} years old.`;
// }
// console.log(greet("Alice", 25)); // Valid
// console.log(greet(25, "Alice")); // InValid

// RETURN TYPES :- Return type of a function
//     function add(a: number, b: number): number {
//         return a + b; // TypeScript return type as `number`
//       }
      
//       function sayHello(): void {
//         console.log("Hello!"); // No return value (void)
//       }

// INTERFACES AND CLASSES
// INTERFACES :- What Properties and Object should have
            // - Not Provide Implementation

// EXAMPLE :- 
          //  interface Person {    // Create Interface
          //   name: string;
          //   age: number;
          //   greet(): string;
          // }

        //   const user: Person = {  // Use Interface
        //   name: "John",
        //   age: 30,
        //   greet: () => `Hello, my name is John.`,
        //  };
        //   console.log(user.greet()); 

// CLASSES :- Blueprint for Object
        // -  Include Property / Methods / Constructors
        
// EXAMPLE :- 
           // class Employee {      // Create Class
           //   name: string;
           //   age: number;

           //   constructor(name: string, age: number) {
           //     this.name = name;
           //     this.age = age;
           //   }

           //   greet(): string {
           //     return `Hello, my name is ${this.name}.`;
           //   }
           // }
        
        //    const emp = new Employee("Alice", 25);      // Use Class
        //    console.log(emp.greet()); // Output: Hello, my name is Alice.

// ACCESS MODIFIERS (PUBLIC / PRIVATE / PROTECTED)
// PUBLIC :- Member accessed anywhere
        // - Inside the Class / Outside the Class / Subclasses
        
// PRIVATE :- Member accessed within class        
        // -  Can not access outside class

// PROTECTED :- Member accessed within class
          // -  Accessed in Subclass
          
// GENERICS :- Create Reusable / Type-safe Components / Functions / Classes   
          //   Work with variety of Types
          //   Code Reusability / Type Safety / Code Maintability
          
// Generic Function :-
// function identity<T>(arg: T): T {
//         return arg;
//     }
    
//     console.log(identity<string>("Hello")); // Output: Hello
//     console.log(identity<number>(42));      // Output: 42
          
// Generic Interface :-
// interface Box<T> {
//         value: T;
//     }
    
//     const numberBox: Box<number> = { value: 100 };
//     const stringBox: Box<string> = { value: "TypeScript" };
    
//     console.log(numberBox.value); // Output: 100
//     console.log(stringBox.value); // Output: TypeScript
    
// Generic Class :- 
// class GenericClass<T> {
//         constructor(private data: T) {}
    
//         getData(): T {
//             return this.data;
//         }
//     }
    
//     const numObj = new GenericClass<number>(123);
//     console.log(numObj.getData()); // Output: 123
    
//     const strObj = new GenericClass<string>("Hello");
//     console.log(strObj.getData()); // Output: Hello
    
// Generic with Multiple Types :-
// function merge<T, U>(obj1: T, obj2: U): T & U {
//         return { ...obj1, ...obj2 };
//     }
    
//     const result = merge({ name: "Alice" }, { age: 25 });
//     console.log(result); // Output: { name: "Alice", age: 25 }
    
// TYPE ALIASES :- Create new name for an existing type
           // - Improve Readability
              // type CarYear = number;
              // type CarType = string;
              // type CarModel = string;

              // type Car = {
              //   year: CarYear;
              //   type: CarType;
              //   model: CarModel;
              // };

              // const myCar: Car = {
              //   year: 2023,
              //   type: "Sedan",
              //   model: "Example Model",
              // };

// TYPE ASSERTIONS :- Treat value as a specific type
              // - Use when typescript can't infer type
              // let value: any = "Hello, World!";
              // let strLength: number = (value as string).length;              

// EXPRESS.JS :-
// Middleware :-
// Built-in middleware express.json() - Parse JSON Incoming Request
// express.urlencoded({ extended: true }) - Parse HTML Form Data
// Custom middleware - Handle (Logging / Authentication)
// Error handling middleware - Basic Error Handling
// global error handling middleware - Consistent Error Response Format        

// ROUTE PARAMETERS - (req.params) - Required - Unique Identifiers userId
// QUERY PARAMETERS - (req.query) - Optional - Filtering , Sorting , Searching

// HAHDLING REQUEST :-  Headers (req.headers)
                     // Body (req.body)
                     // Query Parameters (req.query)
                     // Route Parameters (req.params)

// HANDLING RESPONSE :- 
// res.send(data)     -	Sends a plain response (string, number, object)
// res.json(data)     -	Sends JSON-formatted response
// res.status(code)   -	Sends status code with JSON
// res.redirect(url)  -	Redirects to another URL
// res.sendFile(path) - Sends a file as a response
// res.end()	      - Ends the response process
                     
// NOSQL DATABASE :-
// NOSQL :- (Not Only sql) - Non-Relational Format
                        // - Store Data Documents / Collections Format
                        // - Handle Large Volume of Data

// SQL vs NOSQL
// SQL :- RDBMS Format                       NOSQL :- Non-Relational Format
     // - Tables with Rows / Columns               -  Documents / Key-Value Form
     // - Fixed Schema                             -  Flexible Schema 
     // - Structured Data                          -  Semi-Structured Data
     // - Vertical Scalability                     -  Horizontally Scalability
     // - E-Commerce , Finanacial                  -  Social Media , Real-Time Analytics         

// MONGOOSE RELATIONSHIPS :-
// ONE TO MANY RELATIONSHIP ( ObjectID )     
                     // - One Collection Hold Multiple another collection
// MANY TO MANY RELATIONSHIP ( ObjectId )
                     // - Multiple Collection Hold Multiple Collection                    

// POPULATION :- Retrieving related data from different collections
           // - Allow work with single document
           // - Populate() :- get referenced documents
           
// VIRTUALS FIELDS :- Not Physically Stored in Database
                // -  But Retrieved  on Other Exisiting Data 
                // - Reduced Storage / Simplified Data Access / Upto Date Data
                
// CUSTOM VALIDATION :- Verify User Input /  Meet specific Requirements
// Express-validator :- Request Body Validation
// Mongoose :- Validation define the Schema / Model
// Manual Validation :- Implemented Route / Functions

// BUILT-IN VALIDATORS :- Pre-Defined Function
                     // - required , min , max , minlength , maxlength , email , type , enum

// CUSTOM MIDDLEWARE :- (PRE / POST HOOKS)
// PRE-MIDDLEWARE :- Hook executed before monggose operation
                // - Validate / Modify Data
                
// POST-MIDDLEWARE :- Hook executed after mongoose operation
                // - Logging / Sending Notifications                

// AGGREGATION :- Processing and Transforming Data
             // - Data Flows Series of Stages
           
// SUM :- Sum of multiple data
// AVG :- Average of multiple data             
// COUNT :- Finding Total No. of data
// MIN :- Find Minimum value of data
// MAX :- Find Maximum value of data
// FILTER :- Filter data 
// MATCH :- Filter data based on Specific Criteria
// GROUP :- Group documents based on Field - summing , averaging , counting
// SORT :- Sort Ascending / Descending Order
// LOOKUP :- Combined data from different collections
// PROJECT :- Reshaps the documents - adding , removing , renaming , tranforming Fields

// INDEXING AND OPTIMIZATION
// INDEXING :- Improve Speed of data get - Database
          // - Allow find rows efficiently
          // - Data Structure / Pointers / Lookup methods
          
// MONGGOSE LEAN() :- Return Plain Javascript Object / Instead of Mongoose documents
                 // - Enhance query performance
                 // - Use Read-only operations          

// AUTHANTICATION VS AUTHORIZATION
// AUTHANTICATION :- Verify Identity of User
                // - Validating Credentials
                // - UserName/Password/OTP

// AUTHORIZATION :- Determine Access Rights
               // - Check Permissions Or Roles     
               // - Role Based Access Control
               
// PROTECTED ROUTES :- Require Authentication Before Access Granted
                  // - Authorized users reach certain parts 
                  // Safeguard Sensitive Data
                  
// KEY-FEATURE :- Authentication - Ckecking Credentials
            // - Authorization - Specific Permission
            // - Middleware - Keep Route Handler
            // - Token based - Session Management
            // - Role based - Specific Role Access 
                             

// SQL :- Manage RDBMS system
     // - Allow user to Modify / Tranform Data
     
// MYSQL :- RDBMS System
       // - Store Data Table Form

// MYSQL DATATYPES :- Numeric - INT / FLOAT / NUMERIC , DECIMAL
                 // - Character&String - VARCHAR / CHAR / TEXT
                 // - Date&Time - DATE / TIME / DATETIME
                 // - Other - BOOLEAN / BINARY / VARBINARY / JSON / XML / GEOMETRY
                 
// SQL RELATIONSHIP :- 
// 1. ONE-TO-ONE    2. ONE-TO-MANY    3. MANY-TO-MANY    4. SELF-REFERENCING                

// TYPEORM VS PRISMA
// TYPEORM :- Classed based Schema-file
         // - Wider range Database Support
         // - Generate SQl Query directly
         // - Strong Type Safety
         // - Support Automatic / manual migrations
         
// PRISMA :- Declarative based Schema-file
        // - Prioritize Type-Safety Support
        // - Use Client API
        // - Extremely Strong Type Safety
        // - Powerful Migration Engine         

// SEQUELIZE :- Node.js ORM Library
           // - Support SQL Dialects - PostgreSQL / MySQL / SQLite

// SYNC MODEL :- 
// sequelize.sync() :- Sync the model
// sequelize.sync({ force:true }) :- Drop all tables / Recreate them 
// sequelize.sync({ alter:true }) :- Modify Database Schema
// user.sync() :- Sync Specific one
// sequelize.authenticate() :- Established Before syncing

// ONE-TO-ONE RELATIONSHIP :- 
// hashOne() - User.hasOne(Profile);    - Each user only one profile
// belongsTo() - Profile.belongsTo(User); - profile back to user

// ONE-TO-MANY RELATIONSHIP :- 
// hashMany() - User.hasMany(Post);     - One user write multiple posts
// belongsTo() - Post.belongsTo(User);  - post belongs to one user

// MANY-TO-MANY RELATIONSHIP :- 
// belongsToMany - Student.belongsToMany(Course, { through: 'StudentCourses' }); - Enroll multiple 
// belongsToMany - Course.belongsToMany(Student, { through: 'StudentCourses' }); - Enroll multiple

// TRANSACTIONS :- 1. Managed Trasactions 
                // 2. UnManaged Trasactions

// Manage Trasactions :- Automatically Manage Commit and Rollback Trasaction
// UnManaged Trasactions :- Manually Manage Commit and Rollback Trasaction

// t.commit() - Operation SuccessFull
// t.rollback() - Operation fails

// SEQUELIZE MIGRATION :- Version control our database schema
                     // - Easily Upgrade / Downgrade database States
                     // - Changes database - Up Function
                     // - Revert Changes - Down Function

// Benefits :- Version Control 
            // Same Database Schema
            // Deployment - Update schema in different environments
            // Rollback - Easily revert                      

// RAW QUERY :- sequelize.query():- Execute any SQL Query that is not directly support 
                             // - Return Promise based
                             // - Useful for complex query            

// SWAGGER :- Node.js Framework 
         // - Designing / Building / Documenting API
         // - Uses OpenAPI Specification (OAS)
         // - Define API endpoints / request,response formats
         // - Allows automated documentation or code generation , API testing  
         
// SUPERTEST :- Node.js library 
          // -  Testing HTTP Request to API Endpoints
          // -  Using With Jest framework         

// HELMET :- Middleware Function
        // - Set HTTP Headers
        // - Secure against threats like - XSS attacks , clickjacking
        
// CORS :- (Cross Origin Resource Sharing)
        // - Middleware Function
        // - Manage Cross-Origin Requests

// WEBSOCKETS :- Allow Real-time / Bidirectional communication 
            // - Client and Server side / Manage Connections
            // - Chat app , Online Games , Live Data        

// NEXT.JS :- 
// NextAuth :- ( Auth.Js ) - Authentication Library
           // Support Next.Js Only
           // UI Components not included
           // Self-Hosted
           // Fully Customizable           
           // Free Tier
           // CSRF Token / Cookie Security
           // Google Auth / Email / Credentials Login

// Clerk :- Authentication As a Service / Pre-built Components
         // Suport Next.Js / React / Vue and More
         // UI Components Include (sign-in , profile)
         // Clerk Host it
         // Less Customizable
         // Free Tier with limits
         // Multi-Factore Authentication / Passwordless Login           

// CONTENT SECURITY POLICY - Using Nonce to prevent malicious scripts
// JETBRAINS WEBSTORMS - Testing / Debugging / version control
// JSON-LD ( Linked Data ) - Identify content of webpage   
// MDX - Markdown Mark-up Language / Plain text Html
    // - Allow JSX Directly into markdown file  
// ESLINT - ( Javascript Linter )    
       // - Identify Pattern in Javascript 
       // Avoid bugs / code consistency

// POSTGRESQL :- (ORDBMS) - Object relational database management system
           // - Support SQL ( Relational ) / Json queries ( Non-Relational )   
           
// BASIC PSQL TERMINAL COMMANDS ;- 
// \l - List Databases
// \c - Switch or Connect Databases
// \dt - List Tables
// \dn - List Schemas
// \du - List Users
// \d <TableName> - Describe Table
// \q - Quit psql      

// DBeaver Community - Database Management Tools
                  // - Support All Databases
// Use pgAdmin4 // use Vs Code extension - SQLTools / SQLTools postgreSQl                   

// POSTGRESQL TOPICS:-
// Data Types - Different Data-types
// Managing Tables - Create / Alter / Rename / Add / Drop / Show
// Modifying Data - Insert / Update / Delete
// Querying & Filtering Data - Order By / Where / Limit / Like / Not Like / Between / Having / Group By
// Conditionals Case - Coalesce / nullif() function / Cast
// Control Flow - If-Else / Case / Loop / For / Exit / Continue
// joins & Schema - Different joins / Create , Drop , Alter Schema
// Built-In Functions - Avg() / Count() / Max() / Sum() / Current_Date / Concat / upper / Replace
// Working with Sets - Union / Intersect / Except / Cube / Rollup
// Subquery - Any / All / Exists / CTE - Complex query
// Stored Procedures - Perform Complex Calculation
// Working with Triggers - Automatic Invoke function / Specific Event Occur
                      // - After OR Before Trigger
                      // - Create / Alter / Drop  / Disable / Enable 
// Working with Indexes - Faster Data retrieve 
                     // - Create Index on Specific Column
                     // - Create / Drop / Unique / Reindex
// Errors - Info / Warning / Notice ( Reported Client Side )  
       // - Debug / Log ( Reported Server Side )   
// Exception Handling - User defined / System Defined 
                   // - Create Custom error handling       
                   
// PRISMA (ORM) :- Database Interaction for Node.js
              // - Typescript Support 
              // - Auto-generated Query API
              // - Allow Database Model Clear way
              // - Managing Database Migrations
        // Prisma Client - The auto-generated and type-safe query API
        // Prisma Migrate - A declarative data modeling and migration tool
        // Prisma Studio - A visual editor for managing your database schema and data 
        
// Prisma-Client Project
        
        // Step 1: Initialize project
        // npm init -y
        
        // Step 2: Install required packages
        // npm install express prisma @prisma/client dotenv
        
        // Step 3: Initialize Prisma
        // npx prisma init
        
        //  Step 4: Update .env with MySQL URL
        //  DB_URL="mysql://user:password@localhost:3306/database_name"
        
        // Step 5: Define Prisma model in prisma/schema.prisma
        
        // Step 6: Generate Prisma client
        // npx prisma generate
        
        // Step 7: Push schema to DB
        // npx prisma db push
        
        // Step 8: Open Prisma Studio (optional but requested)
        // npx prisma studio
        
        // Step 9: Run Node.js server
        // node src/server.js

    // Required Packages :- express , prisma , @prisma/client , dotenv    
        
// Nest.Js :- NodeJS framework
         // - Building efficient / scalable / high-grade architecture backend / server-side app
         
// Key-features :- Typescript support - strongly check typescript
              // - Modular architecture - organize code in modules / reusable
              // - Dependency injection - Create own dependencies out of class / use when need
              // - Asynchronous programming - Non-blocking manner         
              // - Powerful CLI - Project setup / code generation

// Topics :-  // - Decorators - Create Controller / Routes / Middleware to handle easily readable
              // - Interceptor - Handle req / res object - cross origin methods
              // - Exception Filters - Privide user friendly error response
              // - Modules - root module - starting point of nest - application graph like internal structure
              // - Providers - Services / Helpers / Factories / Repositories
              // - Pipes - Manage Input validation data
              // - Gaurds - Authorization process - Access control
              // - Testing - Write unit test / end-to-end testing easily

// Key Points – Node Advanced Concepts

// 1. Performance & Scalability

// Gained an overview of Cluster module to utilize multiple CPU cores using worker threads
// Integrated Fork method to automatically recreate workers after crashes or disconnections
// Used a process manager (PM2) to manage, scale, and monitor Node.js processes efficiently
// Implemented load balancing between worker threads to distribute requests evenly
// Learned about Worker Threads API for running CPU-intensive tasks in parallel
// Explored Event Loop phases and how to optimize asynchronous operations for better performance

// 2. CI/CD & Deployment

// Understood CI/CD pipeline concepts for continuous integration and deployment
// Implemented automated pipelines using tools like GitHub Actions / Jenkins / GitLab CI
// Configured automated testing, linting, and build processes before deployment
// Set up staging and production environments for deployment consistency
// Used Docker and Docker Compose for containerized application builds
// Deployed services on cloud platforms (AWS / Azure / GCP) or container orchestration tools (Kubernetes)

// 3. Microservices Architecture

// Gained an overview of Microservices and their modular benefits in Node.js
// Built separate User and Product APIs with distinct endpoints
// Hosted microservices on different ports for isolated execution
// Created Dockerfiles for each service defining dependencies and exposed ports
// Configured a Docker-compose.yml file to connect multiple services via networks
// Implemented inter-service communication using REST or message queues (RabbitMQ, Kafka)
// Added API versioning and documentation (Swagger / OpenAPI)

// 4. API Gateway & Proxy Management

// Learned about API Gateway architecture to route and manage multiple microservices
// Used http-proxy middleware to forward client requests to appropriate service routes and ports
// Implemented centralized routing and error handling via the API Gateway
// Added rate limiting, authentication, and logging middleware in the API Gateway
// Tested and verified endpoints through the unified Gateway server

// 5. Advanced Node.js Features

// Explored Streams for efficient handling of large data transfers

// Implemented Buffer and File System (fs) operations for optimized I/O handling
// Used EventEmitter for custom event-driven programming
// Applied child_process module for spawning and managing subprocesses
// Learned about global error handling using process events (uncaughtException, unhandledRejection)
// Implemented JWT-based authentication for secure API communication
// Applied environment variables and configuration management using .env files

// 6. Monitoring, Testing & Optimization

// Monitored applications using PM2 dashboard and Node.js performance hooks
// Integrated logging frameworks like Winston / Morgan for structured logs
// Implemented unit and integration tests using Mocha / Jest / Supertest
// Measured API response times and memory usage
// Used profiling tools (Node Inspector / Chrome DevTools) to debug performance issues

// Training Sheet :- 
// https://docs.google.com/spreadsheets/d/1WgJNofNBsIh1clmOh6x_Z3A0YSPIeibwUpmCy5ULtF4/edit?gid=0#gid=0