// ******************* Node Core Concepts ********************//

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

// ******************* Node Advanced Concepts ********************//

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
              
// ******************* Express.JS Concepts ********************//

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

// ******************* Database Integration (NoSQL) ********************//
                     
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
     
// ******************* Mongoose Relationships ********************//

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

// ******************* Database Integration (SQL) ********************//
                             
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

// ******************* TypeORM vs Prisma ********************//

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

// ******************* Sequelize Concepts ********************//

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
                             
// ******************* Swagger Concepts ********************//

// SWAGGER :- Node.js Framework 
         // - Designing / Building / Documenting API
         // - Uses OpenAPI Specification (OAS)
         // - Define API endpoints / request,response formats
         // - Allows automated documentation or code generation , API testing  

// ******************* Supertest Concepts ********************//
         
// SUPERTEST :- Node.js library 
          // -  Testing HTTP Request to API Endpoints
          // -  Using With Jest framework      
          
// ******************* Helmet Concepts ********************//

// HELMET :- Middleware Function
        // - Set HTTP Headers
        // - Secure against threats like - XSS attacks , clickjacking

// ******************* CORS Concepts ********************//
        
// CORS :- (Cross Origin Resource Sharing)
        // - Middleware Function
        // - Manage Cross-Origin Requests

// ******************* WebSockets Concepts ********************//

// WEBSOCKETS :- Allow Real-time / Bidirectional communication 
            // - Client and Server side / Manage Connections
            // - Chat app , Online Games , Live Data      
            
// ******************* Next.JS Concepts ********************//

// NEXT.JS :- 
// NextAuth :- ( Auth.Js ) - Authentication Library
           // Support Next.Js Only
           // UI Components not included
           // Self-Hosted
           // Fully Customizable           
           // Free Tier
           // CSRF Token / Cookie Security
           // Google Auth / Email / Credentials Login

// ******************* Clerk Concepts ********************//

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

// ******************* PostgreSQL Concepts ********************//

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

// ******************* Prisma Concepts ********************//
                   
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

// ******************* Nest.JS Concepts ********************//
        
// Nest.Js :- NodeJS framework
         // - Building efficient / scalable / high-grade architecture backend / server-side app
         
// Key-features :- Typescript support - strongly check typescript
              // - Modular architecture - organize code in modules / reusable
              // - Dependency injection - Create own dependencies out of class / use when need
              // - Asynchronous programming - Non-blocking manner         
              // - Powerful CLI - Project setup / code generation

// Topics :-  // - Decorators - 1. Class Decorator - @Controller(), @Module(), @Injectable() - Define nestjs structure
                           //   2. Method Decorator - @Get(), @Post() - Define routes & handlers
                           //   3. Parameter Decorator - @Body(), @Param() - Extract data from requests
                           //   4. property Decorator - @Inject() - Inject dependencies
                           //   5. Custom Decorator - @User() - Custom reusable logic
              // - Controllers - Handling incoming request / Sending response with routing mechanism
              // - Providers - Services / Helpers / Factories / Repositories - Injected as dependency
              // - Modules - root module - starting point of nest - application graph like internal structure
              // - Middlewares - Access to the request / response cycle
              // - Exception Filters - Handle / customize error responses / logging tools
              // - Interceptor - Handle req / res object - Transforming response in consistent mannner
              // - Pipes - Modify / validate incoming data like DTO's 
              // - Gaurds - Authorization / Permissions - Access control
              // - Testing - Write unit test / end-to-end testing 

// Circular dependency - Two or more module depend on each other
                         //  - Userservice depends on Postsservice        
                         //  - Postservice depends on Usersservice   
                         
// Module Reference - Programatically access / Use Providers, Services, Repositories
                         // ModuleRef.get - give access for dependency injection
                         // {strict:false} - allow outside module to current providers
                         // onModuleinit() - Initialize dependency after the module is loaded
                         
// Lazy-loading -  Loading modules when they are needed or their route is accessed
                   // -  Instead of loading all module when app starts                 
                   // -  Use loadChildren with dynamic import() in RouterModule.register()

// Execution context - Used inside Gaurds, Interceptors, exception filters
                   // -  Access Request / Response / Contetextual data
                   // context.getClass()      - Returns the controller class
                   // context.getHandler()    - Returns the handler (method)
                   // context.switchToHttp().getRequest()    - Returns the HTTP request
                   // context.switchToHttp().getResponse()   - Returns the HTTP response
                   // context.getType()	   - Returns the type (http, rpc, or ws)
                   
// Life-cycle events - when a module, provider, or controller is initialized
                     //   - run code at specific points

            // Hook	                 When it Runs	                                                Used In
        // onModuleInit()	After Nest creates and initializes the module’s providers	Providers, Controllers
        // onModuleDestroy()	Before the module is destroyed	                                Providers, Controllers
        // onApplicationBootstrap()	After all modules are initialized	                Providers, Controllers
        // onApplicationShutdown()	During application shutdown (graceful shutdown)	        Providers, Controllers
        // beforeApplicationShutdown()	Right before application shutdown	         Providers, Controllers    
        
// Discovery service - Used for inspecting controllers / providers / metadata
                       // - Used with Reflector, MetadataScanner
                       // - Auto-registration / Dynamic modules or plugins / scheduled jobs 
                       
// Validation - validate incoming data
                // - ValidationPipe, ParseIntPipe, ParseBoolPipe, ParseArrayPipe, ParseUUIDPipe
                // - Uses class-validator and class-transformer with DTOs

                // Pipe	                      Purpose	               Example Input	           Result / Error
                // ValidationPipe	Validates DTO fields	     { "age": 10 }	           400 Bad Request
                // ParseIntPipe	      Converts string → number	       "10" → 10	           400 if "abc"
                // ParseBoolPipe	Converts string → boolean    "true" → true	           400 if "yes"
                // ParseArrayPipe	Converts string → array	       "1,2,3" → [1,2,3]	   400 if invalid
                // ParseUUIDPipe	Validates UUID format	         "uuid"	                   400 if not UUID

// Serialization - Hide sensitive data (like passwords or internal fields)
                  //  - Format data before sending (e.g., renaming properties or transforming values)
                  //  - Control the shape of response objects
                  //  - built-in ClassSerializerInterceptor, to handle serialization
                  //  - together with the class-transformer package
                  //  - Use decorators from class-transformer like @Exclude() and @Expose()

             // Use Globally - every response in your app automatically goes through the serialization process
             // Use Groups   - such as user roles (admin, public)

             // Decorator / Feature	                                        Description
             // @Expose()	                                   Include property in serialized output
             // @Expose({ groups: [...] })	                   Include only when that group is active
             // @Exclude()	                                   Always hide property
             // @SerializeOptions({ groups: [...] })	           Apply group(s) at controller or route level
             // ClassSerializerInterceptor	                   Performs the transformation automatically     

// Versioning - manage different versions of your API endpoints
                // - need to update or redesign endpoints

                // Type	                        Description	                    Example
                // URI	                     Version in URL path	           /v1/users
                // HEADER	             Version in custom header	       X-API-Version: 2
                // MEDIA_TYPE	             Version in Accept header	    Accept: application/json;v=2
                // CUSTOM	     You define how version is extracted      ?version=2, cookie, etc.

                // <!-- v1 Users -->
                // curl -s http://localhost:3000/v1/users | jq

                // <!-- v2 Users -->
                // curl -s http://localhost:3000/v2/users | jq

                // <!-- Neutral Routes -->
                // GET → /v1/status
                // curl -s http://localhost:3000/v1/status | jq

                // GET → /v2/status
                // curl -s http://localhost:3000/v2/status | jq

                // GET → /status
                // curl -s http://localhost:3000/status | jq

 
// Events - message or signal emitted with handled asynchronously
           //  - Emitter: A part of your code that emits an event (e.g., when a user signs up).
           //  - Listener: A function or class method that listens for that event and performs some action (e.g., sending a welcome email).

        //    Concept	                                               Description
        //    EventEmitterModule	                      Enables event-based communication
        //    EventEmitter2	                              Used to emit events
        //    @OnEvent()	                              Decorator to listen for specific events

// HTTP Module - Allows to call external API's, microservices, other servers
           //  - Wrapped around axios 
           //  - Import HttpModule / Inject HttpService

        //    | Feature              | Description                                          |
        //    | -------------------- | ---------------------------------------------------- |
        //    | **Module**           | `HttpModule` from `@nestjs/axios`                    |
        //    | **Service**          | `HttpService` (Axios-based)                          |
        //    | **Return Type**      |  RxJS `Observable`                                   |
        //    | **Common Functions** | `get()`, `post()`, `put()`, `delete()`, etc.         |
        //    | **Configurable**     |  Yes — supports timeouts, interceptors, headers|
           

// File Uploading - way to handle file uploads using interceptors and Multer

// | Feature          | Decorator/Interceptor                                                 | Description                    |
// | ---------------- | --------------------------------------------------------------------- | ------------------------------ |
// | Single File      | `FileInterceptor('file')`                                             | Upload one file                |
// | Multiple Files   | `FilesInterceptor('files', maxCount)`                                 | Upload many files (same field) |
// | Different Fields | `FileFieldsInterceptor([{ name: 'avatar' }, { name: 'background' }])` | Multiple named fields          |
// | File Storage     | `diskStorage()`                                                       | Define path & filename         |
// | File Validation  | `fileFilter`                                                          | Allow only certain MIME types  |


// | Storage Type                 | Persistence             | Speed        | Scalability | Best Use Case                  |
// | ---------------------------- | ----------------------- | ------------ | ----------- | ------------------------------ |
// | **diskStorage**              | ✔️ Persistent (locally) | ⚡ Fast       | ❌ Low       | Local or small apps            |
// | **memoryStorage**            | ❌ Temporary             | ⚡⚡ Very fast | ⚠️ Medium   | Processing before cloud upload |
// | **Cloud Storage (S3, etc.)** | ✔️ Persistent (remote)  | ⚡ Medium     | ✅ High      | Production deployments         |


// Streaming Files - Sending files to the client chunks
                // - Instead of whole file

                // | Approach                          | Use Case                               |
                // | --------------------------------- | -------------------------------------- |
                // | `fs.createReadStream().pipe(res)` | Simple streaming                       |
                // | Handle `Range` header manually    | Video/audio playback                   |
                // | `StreamableFile`                  | Clean, built-in abstraction (Nest v8+) |

// WebSockets :- Gateways, Exception Filters, Pipes, Guards, Interceptors, Adapters
           // :- Gateways - Used to Handle Real-time (Chat App, Live notifications, Multiplayer games, real-time dashboards) 
             // @WebSocketGateway() → Create a Websocket server
             // @WebSocketServer() → injects the Socket.IO server / Give direct access 
             // @SubscribeMessage('message') → listens to 'message' events from clients
             // server.emit() → sends messages back to all connected clients   
             
// Adapters :- Tells the framework how to create / manage Websocket servers
         // -  IoAdapter - Wraps Socket.IO
         // -  WsAdaptor - Wraps ws (WebSocket Library)
     // Adapters allow - Add custom validation logic
                    // - Integrate third party Websocket systems
                    // - override default Socket.Io // Ws
                    
     // Socket.IO Adapter :- part of the @nestjs/platform-socket.io package
                      //  -  Boots a Socket.IO server
                      //  -  Manages automatic reconnection, event broadcasting, rooms, events
                      //  -  Works automatically with @WebSocketGateway()               
                          
     // WS Library Adapter :- part of the @nestjs/platform-ws package
                      //  -  Faster, No rooms/namespaces built-in, 
                      //  -  Use of games, streaming

     // Custom WebSocket Adapter :- Part of the WebSocketAdapter
                      //  -  Integrating with a different WebSocket library     
                      
// OpenAPI :- Swagger - Generate interactive API documentation

// Mapped types :- Helper utilities
            //  -  Allow to transform existing classes - DTO's
        //      Utility          |     What it does          |
        // | --------------------| ------------------------- |
        // |  PartialType        | Makes all fields optional |
        // |  PickType           | Selects fields            |
        // |  OmitType           | Excludes fields           |
        // |  IntersectionType   | Combines two types        |
        // |  RequiredType       | Makes fields required     |

// HTTP Adapter :- Nest uses to communicate with the underlying HTTP server implementation
             // -  allows Nest to run on different HTTP platforms without changing your application code
        // | Adapter            | Package                    | Notes                   |
        // | ------------------ | -------------------------- | ----------------------- |
        // |  ExpressAdapter   | `@nestjs/platform-express` | Default, widely used    |
        // |  FastifyAdapter   | `@nestjs/platform-fastify` | Faster & more efficient |
        // |  Custom Adapter   | You can write your own     | For non-Express servers |

        // Custom Adapter - Use HttpAdapterHost

// Read-Eval-Print-Loop (REPL) :- Allow to test & experiment app threw commandline
                            //  - Test services / controllers / functions without run entire app
                            //  - Quick debugging / Inspect app
                            //  - give access app context - manipulate DB threw terminal

// Hot Reload :- Feature that allow watches for changes 
            // - Typescript files / Re-compiles / Restart application    
            // - "scripts": {
                        //   "start:dev": "ts-node-dev --respawn --loader ts-node/esm src/main.ts"
                        //  }

// ******************* Node Advanced Concepts ********************//

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

// Nest.JS Task :-
// ******************* Nest.JS Task ********************//

// Authentication & User Management

// User Module
// Create User model with fields:
// id
// name
// email
// password
// role (ADMIN, ORGANIZER, USER)

// Auth Module
// Signup API
// Login API (JWT)
// Access token + Refresh token
// Password hashing (bcrypt)
// Authorization guard for ADMIN & ORGANIZER

// Event Module
// Task 5: Event CRUD
// Create Event model with fields:
// id
// title
// description
// venue
// startDate
// endDate
// category
// bannerImage URL
// createdBy (organizer)

// Endpoints:
// POST /events (Organizer/Admin)
// GET /events
// GET /events/:id
// PATCH /events/:id
// DELETE /events/:id

// Event Search + Filters
// Add filters:
// category
// date range
// venue
// keyword search
// pagination
// sorting (newest, oldest)
// Upload Event Banner
// File upload (Multer)
// Upload to local or S3 bucket
// Save image URL in DB

// Tickets & Bookings Module
// Ticket Model
// Fields:
// ticketId
// eventId
// price
// quantity
// availableCount
// type (VIP, Regular, Free)

// Booking Module
// Endpoints:
// POST /bookings
// Deduct ticket quantity
// Generate booking number
// GET /bookings/my
// GET /bookings/:id

// Notifications Module
// Push Notifications 
// FCM integration
// Notify users when:
// new event is posted
// booked event is updated

// ******************* face_recognition Library ********************//
 
// face_recognition library :- Face Detection

// face_recognition library in Python for real-time face detection.
 
// Step 1: Install the Required Libraries
// First, you’ll need to install the following libraries:
// OpenCV: For real-time video capture.
 
// dlib: For face detection and other advanced facial recognition tasks.
 
// face_recognition: To easily detect and recognize faces using dlib.
 
// You can install these libraries using pip:
 
// pip install opencv-python
// pip install dlib
// pip install face_recognition
 
// Step 2: Capture Video Stream Using OpenCV
// Use OpenCV to capture the video stream from a webcam or any other video source. 
// OpenCV provides functionality to grab frames in real-time.

// ******************* CompreFace Library ********************//

// Exadel CompreFace – Face Detection

//  - CompreFace is a free, open-source facial recognition system developed by Exadel.
//  - It is delivered as a Docker-based application (via docker-compose) — so you can self-host it on your own servers (on-premises), or deploy it in the cloud.
// CompreFace runs using Docker, which makes setup extremely easy.
// You just need to download the official repository and run the services.
 
// Step 1: Download & Run CompreFace
 
// Commands:
// git clone https://github.com/exadel-inc/CompreFace.git
// cd CompreFace
// docker-compose up -d
 
// This starts:
// Backend API
 
// Face recognition plugins
 
// UI Dashboard
 
// Database
 
// Access Dashboard:
// http://localhost:8000
 
// Step 2: Create an Application & Get API Key
// Inside the dashboard:
// Login with admin / admin (first run).
 
// Create a new Face Recognition application.
 
// Copy the API key — this is required by your backend.
 
// The base API URL:  http://localhost:8000/api/v1
 
// Step 3: Manage Known Faces (Subjects)
// Using the dashboard:
// Add “subjects” (people to recognize).
 
// Upload reference photos for each person.
 
// These become your trained face database.
 
// No training code required — CompreFace handles everything automatically.
 
// Step 4: Send Image to API for Recognition
// You can send frames or images from:
// Node.js backend
 
// Python script
 
// Mobile app
 
// Web app
 
// Example (Node.js): Send Request
 
// POST /recognition/recognize
// Headers:
//   x-api-key: YOUR_API_KEY
// Body:
//   file: <image>
 
// CompreFace responds with:
// Detected faces
 
// Person name (if matched)
 
// Similarity score
 
// Age, gender
 
// Landmarks
 
// Bounding boxes
 
 
// Step 5: Use in Real-Time Systems
// You can call CompreFace repeatedly to process:
// Live webcam frames
 
// CCTV camera feeds
 
// Video stream frames
 
// Just convert each frame → send to API → get recognition result.
 
// Summary 
// Exadel CompreFace is a full face recognition server that runs locally with Docker.
 
// Provides REST API + Dashboard for easy management.
 
// Supports face detection, recognition, verification, attributes.
 
// Add known persons (“subjects”) via UI for automated face matching.
 
// Use API from any backend (Node, Python, Java, mobile apps).
 
// Suitable for real-time systems, attendance, security, access control, and identity verification.
 
// Fully private / on-premise, no cloud required.
 
// Free & open-source.

// ******************* MapBox Library ********************//

// Leaflet.Js / MapBox Library :- Use to tracking real time live location 
// MAPBOX_TOKEN=MAPBOX_TOKEN_PUT

// NEXT-Project :-
// GITHUB_ID=Iv23liEUwWFQvGA8LW5G
// GITHUB_SECRET=5a384d56d824125d5cc203708043ba482d9af116

// ******************* GIT MANAGEMENT ********************//
// Git Branch :- 
// 1️⃣ Repo clone karo (agar pehle se nahi hai)
// git clone <repo-url>
// cd <repo-folder-name>

// 2️⃣ Current branch check karo
// git branch


// 👉 * wali branch aapki current branch hoti hai (usually main ya master)

// 3️⃣ Nayi branch banao
// git branch new-branch-name


// Example:

// git branch feature-login

// 4️⃣ Nayi branch pe switch karo
// git checkout feature-login


// 💡 Short trick (branch banana + switch ek saath):

// git checkout -b feature-login

// 5️⃣ Confirm karo ki aap nayi branch pe ho
// git branch


// 👉 Aapko aisa dikhega:

// * feature-login
//   main

// 6️⃣ Ab coding karo (safe 🎉)

// Files edit karo

// New code likho

// Main branch bilkul safe rahegi

// 7️⃣ Changes save (commit) karo
// git status
// git add .
// git commit -m "Login feature added"

// 8️⃣ Remote pe branch push karo (agar GitHub/GitLab pe chahiye)
// git push origin feature-login

// 9️⃣ Kabhi main branch pe wapas jana ho
// git checkout main


// hum new branch ko existing (main/master) branch ke sath merge karenge. Step-by-step dekho 👇

// 🔁 Branch merge karne ke steps
// 1️⃣ Pehle main branch pe jao
// git checkout main


// (ya master — jo bhi aapki main branch ho)

// 2️⃣ Latest code pull kar lo (important)
// git pull origin main


// 👉 Isse ensure hoga ki main branch updated hai

// 3️⃣ Ab apni new branch merge karo
// git merge feature-login


// (feature-login = aapki new branch ka naam)

// ✅ Agar koi conflict NAHI aaya

// Git bolega:

// Merge made successfully


// 🎉 Done! Branch merge ho gayi

// ⚠️ Agar merge conflict aa jaye

// Git bolega:

// CONFLICT (content): Merge conflict in file-name

// Conflict solve karne ka tarika:

// Conflict wali file open karo

// Aisa code dikhega:

// <<<<<<< HEAD
// (main branch code)
// =======
// (feature branch code)
// >>>>>>> feature-login


// Decide karo kaunsa code rakhna hai

// <<<<<<< ======= >>>>>>> wali lines delete karo

// File save karo

// Phir:
// git add .
// git commit -m "Merge conflict resolved"

// 4️⃣ Merge ke baad main branch push karo
// git push origin main

// 🧹 (Optional) Branch delete kar sakte ho

// Agar kaam complete ho gaya:

// git branch -d feature-login


// Remote se delete:

// git push origin --delete feature-login

// 🧠 Summary (short)
// git checkout main
// git pull origin main
// git merge feature-login
// git push origin main


// Aap feature-login branch pe kaam kar rahe ho aur kisi aur ne main branch me changes push kar diye.
// Ab aapko apni branch ko latest main ke sath update karna hai — bina apna code kharab kiye.

// ✅ Best & Safe Tarika (RECOMMENDED)
// 1️⃣ Apni feature branch pe hi raho
// git checkout feature-login

// 2️⃣ Main ke latest changes fetch karo
// git fetch origin

// 3️⃣ Main branch ko apni branch me merge karo
// git merge origin/main


// 👉 Isse:

// Main ke latest changes aapki feature branch me aa jayenge

// Aapka feature code safe rahega

// ⚠️ Agar conflict aaye

// Same process:

// Conflict wali files open karo

// Conflict resolve karo

// Phir:

// git add .
// git commit -m "Merge main into feature-login"

// 🔁 Alternative (Advanced) – Rebase (Clean history)

// Tab use karo jab Git samajh aa jaye

// git checkout feature-login
// git fetch origin
// git rebase origin/main


// Agar conflict aaye:

// git add .
// git rebase --continue


// ⚠️ Warning:
// Rebase shared branch pe mat karna (agar branch already push ho chuki ho aur team use kar rahi ho).

// ******************* Backend Developer Concepts ********************//

// New & Emerging Backend Developer Concepts :-

// Backend Engineer (Cloud-Native) :-
// Focus on Kubernetes, Docker, AWS/GCP/Azure
// Builds systems designed to scale automatically
// Uses Infrastructure as Code (Terraform, Pulumi)

// Serverless Backend Developer :-
// Uses AWS Lambda, Cloud Functions
// No server management
// Event-driven architecture
// Pay-per-execution model

// Backend for AI / ML Systems :-
// Builds APIs for AI models
// Handles inference pipelines, vector databases (Pinecone, Weaviate)
// Works with LLM backends (OpenAI, local models)

// Platform Engineer (new evolution of backend) :-
// Builds internal developer platforms
// Focus on CI/CD, observability, reliability
// Uses tools like Backstage, ArgoCD

// Event-Driven Backend Developer :-
// Uses Kafka, RabbitMQ, NATS
// Designs systems around events instead of REST calls
// High-throughput & real-time systems

// Backend Developer with Edge Computing :-

// Runs backend logic at the edge (Cloudflare Workers, Vercel Edge)
// Ultra-low latency
// New model of backend execution

// API-First / Contract-Driven Backend :-
// Uses OpenAPI, GraphQL, gRPC
// Backend is designed around contracts before code
// Strong typing & schema validation

// Modern Backend Tech Stack (2025-ish)

// Languages: Go, Rust, TypeScript, Python
// Databases: Postgres, MongoDB, Redis, Vector DBs
// Architecture: Microservices, Serverless, Event-Driven
// Security: Zero Trust, OAuth2, JWT, mTLS
// Observability: OpenTelemetry, Prometheus, Grafana

// ******************* AI Concepts for Backend Devs ********************//

// Must-Learn AI Concepts for Backend Devs :-

// 1️⃣ LLM Basics (Very Easy)
// What is an LLM?

// LLM = Large Language Model

// An LLM is an AI model trained on massive amounts of text so it can:

// Understand text
// Generate text
// Answer questions
// Write code
// Summarize, translate, classify, etc.

// Examples you already know

// ChatGPT → by OpenAI
// Claude → by Anthropic
// Gemini → by Google

// 📌 Think of an LLM as:

// A super-smart text prediction engine
// It doesn’t “think” like a human — it predicts the next best word based on context.
// How LLMs are used by backend developers

// As a backend dev, you don’t train LLMs.
// You call them via APIs just like:

// Payment gateways (Stripe)
// Email services (SendGrid)
// SMS services (Twilio)

// Example use cases:

// Chatbots
// Code assistants
// Auto-reply systems
// Data summarization
// Log analysis
// AI search

// 👉 LLM = another backend service

// Tokens (Very Important but Simple)

// LLMs don’t read words, they read tokens.

// What is a token?
// A token ≈ part of a word

// Example:
// "ChatGPT is awesome"  

// Tokens might be:
// ["Chat", "GPT", " is", " awesome"]


// 📌 Rule of thumb:

// 1 token ≈ 4 characters in English
// 1000 tokens ≈ 750 words
// Why tokens matter (backend mindset)

// Tokens affect:

// Cost 💰 (you pay per token)
// Speed ⚡
// Limits 🚧

// As a backend dev, you must:

// Limit input size
// Trim unnecessary text
// Control output length
// Context Window (Super Important)

// What is context window?

// It’s the maximum number of tokens the model can “remember” at one time.

// Example:

// Model context window: 16k tokens

// Input + output must fit inside that limit

// 📌 If context is too big:

// Old messages get forgotten
// Model gives wrong or incomplete answers

// Backend example

// If you send:

// User message
// Previous chat history
// System instructions
// API data
// All of that counts toward the context window.

// 👉 Backend responsibility:

// Store chat history
// Send only important messages
// Summarize old data

// Prompt Engineering (Backend-Style)
// What is a prompt?
// A prompt is simply the instruction you send to the LLM.

// Bad prompt:
// Explain JWT

// Good backend-style prompt:

// Explain JWT in simple terms.
// Audience: Junior backend developer.
// Output: Bullet points.
// Length: Under 150 words.

// 📌 Prompt engineering = writing clear instructions

// Backend-Style Prompt Structure (Golden Rule)

// Think like an API request:

// ROLE:
// You are a senior Node.js backend engineer.

// TASK:
// Explain JWT authentication.

// CONSTRAINTS:
// - No more than 150 words
// - Use simple language
// - No math

// OUTPUT FORMAT:
// - Bullet points

// This makes responses:

// Predictable
// Consistent
// Easy to parse

// Why prompt engineering matters for backend devs

// You want consistent JSON outputs
// You want less hallucination
// You want machine-readable responses

// Example:

// Return output strictly in JSON.
// Do not include explanations.

// This is backend gold 🥇

// Mental Model (Remember This)

// LLM is like:

// A function
// Input = prompt (text)
// Output = response (text/JSON)
// const response = await llm(prompt);

// What you should remember (Summary)

// ✅ LLM = text prediction engine
// ✅ You use LLMs via APIs, not training
// ✅ Tokens = cost + limits
// ✅ Context window = memory
// ✅ Prompt engineering = clear instructions
// ✅ Backend devs focus on structure & constraints

// 2️⃣ AI APIs (MOST IMPORTANT)

// Start with:

// OpenAI API (or similar)

// Text → response
// JSON structured output
// Function calling / tools

// Example use cases:

// Auto reply system
// AI chatbot backend
// Smart search
// Code generation backend
// AI customer support

//****************** AI Basics & Tasks ********************//

// Week 1: AI Basics (No Math)

// What to Learn
// What is AI, LLM, Generative AI
// How ChatGPT / LLMs work (high-level)
// Tokens, temperature, context window
// Prompt engineering for backend

// Hands-on

// Write prompts for:

// Summarization

// Q&A
// JSON output
// Compare good vs bad prompts

// Deliverable
// Markdown file with prompt templates

// Week 2: OpenAI API + Node.js

// What to Learn

// OpenAI API basics
// Chat completions
// Structured JSON responses
// Error handling & retries

// Hands-on

// Node.js + Express API

// Endpoint:

// POST /ai/chat

// Save chat history in MongoDB

// Deliverable
// AI Chat API (basic)

// Week 3: Authentication, Rate Limiting & Cost Control

// What to Learn
// JWT auth
// API rate limiting
// Token usage optimization
// AI request caching (Redis)

// Hands-on

// Secure AI endpoints
// Limit requests per user
// Cache AI responses

// Deliverable
// Production-ready AI API with auth

// Week 4: Async AI Jobs & Queues

// What to Learn
// Why AI must be async
// BullMQ / Redis queues
// Background processing

// Hands-on

// Long AI tasks in background
// Job status API
// Error retry logic
// Deliverable
// AI Task Queue System

// 📅 MONTH 2: Vector Databases + RAG (🔥 MOST IMPORTANT)
// Week 5: Embeddings & Vector DB

// What to Learn

// What are embeddings
// Similarity search
// Vector databases
// Tools
// pgvector (PostgreSQL) OR Pinecone

// Hands-on

// Convert text → embeddings
// Store in DB
// Search similar content

// Deliverable
// Vector Search API

// Week 6: RAG (Retrieval Augmented Generation)

// What to Learn
// RAG architecture
// Chunking strategies
// Context injection

// Hands-on

// User asks question
// Backend retrieves relevant docs
// Sends to LLM
// Deliverable
// RAG-powered Q&A API

// Week 7: Document AI (Real-World Use Case)

// What to Learn

// PDF/Text ingestion
// Chunking large files
// Background indexing

// Hands-on

// Upload PDF
// Convert to embeddings
// Ask questions from document
// Deliverable
// AI Document Search System

// Week 8: Chat Memory & Context Management

// What to Learn
// Conversation memory
// Short vs long-term memory
// Token optimization

// Hands-on

// Store chat history
// Use vector memory
// Clean old messages
// Deliverable
// Chatbot with memory

// 📅 MONTH 3: Production-Level AI Systems
// Week 9: AI Security (VERY IMPORTANT)

// What to Learn

// Prompt injection attacks
// Jailbreak attempts
// Input sanitization
// Role-based prompts

// Hands-on

// Secure prompts
// Prevent malicious inputs
// Deliverable
// Secure AI backend layer

// Week 10: AI System Design

// What to Learn
// AI backend architecture
// Scaling AI APIs
// Cost optimization strategies

// Hands-on

// Design diagrams
// Load handling
// Redis + queues + DB

// Deliverable

// AI System Design Doc

// Week 11: Final Project (Resume Gold)

// Choose ONE:

// Option A: AI Customer Support Backend

// Auto replies
// Knowledge base
// Human escalation

// Option B: AI Developer Assistant

// Code explanation
// Bug detection
// PR review

// Option C: AI SaaS Backend

// Auth
// Payments mock
// Usage tracking
// Deliverable
// Full backend repo

// README + architecture

// Week 12: Interview Prep + Portfolio

// What to Learn

// AI backend interview questions

// Explain RAG clearly

// System design discussions

// Hands-on

// Write case studies

// Update resume
// Deploy project (Railway / AWS)
// Deliverable
// Deployed AI project

// Updated resume

// 🛠️ Tech Stack You’ll Use

// Node.js / Express / Fastify
// MongoDB / PostgreSQL
// Redis
// BullMQ
// OpenAI API
// pgvector / Pinecone
// Docker

// 🧾 Resume Keywords (After 3 Months)

// You can honestly write:

// AI-Enabled Backend Developer
// LLM API Integration
// RAG Architecture
// Vector Databases
// AI Security & Cost Optimization

// ******************* RAG Architecture ********************//

// RAG (Retrieval-Augmented Generation)
// 🧠 What is RAG (Quick Mental Model)

// RAG = Search + LLM

// Instead of asking the LLM everything, you:

// Store knowledge in a database (docs, PDFs, FAQs)

// Retrieve only relevant chunks

// Inject them into the LLM prompt

// Get accurate, grounded answers

// User Question
//    ↓
// Embedding
//    ↓
// Vector Search
//    ↓
// Relevant Chunks
//    ↓
// LLM (with context)
//    ↓
// Answer

// 1️⃣ RAG Architecture (Must Know)
// Core Components
// Component	                         Purpose
// Document Loader	           Load PDFs, text, DB data
// Chunker	                       Split documents
// Embedding Model	              Convert text → vectors
// Vector DB	                     Store & search embeddings
// Retriever	                       Fetch relevant chunks

// LLM	Generate final answer
// 2️⃣ Chunking Strategies (VERY Important)

// Bad chunking = bad answers ❌

// Common Strategies
// 🔹 Fixed-size chunking (Start here)
// chunkSize: 500 tokens
// overlap: 50 tokens


// ✅ Simple
// ❌ Can break meaning

// 🔹 Semantic chunking (Advanced)

// Split by:

// Headings
// Paragraphs
// Sentences

// ✅ Best quality
// ❌ Slightly complex

// 🔹 Rule of Thumb
// Short docs → smaller chunks
// Long docs → larger chunks


// 📌 Recommended for beginners

// 400–600 tokens with 50–100 overlap

// 3️⃣ Context Injection (Prompt Design)

// This is where backend devs shine.

// ❌ Bad Prompt
// Answer the user's question

// ✅ Good RAG Prompt
// You are a helpful assistant.
// Use ONLY the provided context to answer.

// Context:
// {retrieved_docs}

// Question:
// {user_question}

// If the answer is not in context, say:
// "I don't know based on the provided data."

// 📌 This prevents hallucinations.

// 🛠 Step-by-Step Implementation
// Step 1: Ingest Documents
// const docs = loadDocuments("./docs");

// const chunks = splitText(docs, {
//   chunkSize: 500,
//   overlap: 50
// });

// Step 2: Create Embeddings
// const embeddings = await openai.embeddings.create({
//   model: "text-embedding-3-small",
//   input: chunks
// });

// Step 3: Store in Vector DB
// await vectorDB.upsert({ 
//   id,
//   embedding,
//   metadata: { text: chunk }
// });

// Step 4: User Question → Embedding
// const queryEmbedding = await openai.embeddings.create({
//   model: "text-embedding-3-small",
//   input: userQuestion
// });

// Step 5: Retrieve Relevant Chunks
// const results = await vectorDB.query({
//   vector: queryEmbedding,
//   topK: 5
// });

// Step 6: Inject Context into LLM
// const context = results.map(r => r.metadata.text).join("\n");

// const response = await openai.chat.completions.create({
//   model: "gpt-4o-mini",
//   messages: [
//     {
//       role: "system",
//       content: "Use the context to answer accurately."
//     },
//     {
//       role: "user",
//       content: `Context:\n${context}\n\nQuestion:\n${userQuestion}`
//     }
//   ]
// });

// 5️⃣ Deliverable: RAG-Powered Q&A API
// API Design
// POST /ask
// {
//   "question": "What is the refund policy?"
// }

// Response
// {
//   "answer": "The refund policy allows returns within 30 days..."
// }

// ✅ Overlap ka solution

// overlap bolta hai:

// Next chunk thoda sa previous chunk ka text repeat kare

// chunkSize: 500,
// overlap: 50


// ➡️ Har next chunk me last 50 tokens repeat honge

// Example:

// Chunk 1: [0 – 500]
// Chunk 2: [450 – 950]  ← 50 tokens overlap
// Chunk 3: [900 – 1400]

// Original text:

// Node.js is a runtime built on Chrome's V8 engine.
// It is used for building scalable backend services.

// Agar chunk yahan se toot gaya:

// Chunk 1: Node.js is a runtime built on Chrome's
// Chunk 2: V8 engine. It is used for building scalable backend services.

// ✅ topK: 5 ka matlab

// Top 5 sabse relevant chunks lao

// const results = await vectorDB.query({
//   vector: queryEmbedding,
//   topK: 5
// });

// Matlab:

// 1️⃣ Chunk about refund rules
// 2️⃣ Chunk about cancellation
// 3️⃣ Chunk about payment policy
// 4️⃣ Chunk about exceptions
// 5️⃣ Chunk about timelines

// LLM ko ye 5 chunks context me milte hain.

// ******************* OpenAI-API ********************//

// OpenAI Models :- gpt-3.5-turbo
// OpenAI API Key :- stored in environment variable (OPENAI_API_KEY)
// OpenAI API URL :- https://api.openai.com/v1
// OpenAI API Endpoint :- /chat/completions
// OpenAI API Method :- POST
// OpenAI API Headers :- Authorization: Bearer <OPENAI_API_KEY>
// OpenAI API Body :- {
//   "model": "gpt-3.5-turbo",
//   "messages": [
//     { "role": "user", "content": "Hello, how are you?" }
//   ]
// }

// ******************* GroqAI-API ********************//

// GroqAI Models :- llama-3.1-8b-instant
// GroqAI API Key :- stored in environment variable (GROQ_API_KEY)
// GroqAI API URL :- https://api.groq.com/v1
// GroqAI API Endpoint :- /chat/completions
// GroqAI API Method :- POST
// GroqAI API Headers :- Authorization: Bearer <GROQ_API_KEY>
// GroqAI API Body :- {
//   "model": "llama-3.1-8b-instant",
//   "messages": [
//     { "role": "user", "content": "Hello, how are you?" }
//   ]
// }



// ******************* AI Foundations ********************//

// 1️⃣ AI Foundations (Fast – 2 weeks)

// Focus ONLY on:

// What is LLM
// Tokens, context window
// Temperature / top-p
// Embeddings kya hoti hai
// Why hallucinations happen

// 👉 Tum ye already start kar chuke ho ✅

// 2️⃣ LLM Integration with Node.js (MOST IMPORTANT)

// Tumhara core weapon ⚔️

// Seekho:
// OpenAI / Azure OpenAI / open-source LLM APIs
// Streaming responses (SSE / WebSockets)
// Rate limiting & retries
// Prompt templates & versioning

// Node stack:

// Express / Fastify
// LangChain.js
// Zod (schema validation)
// 📌 Skill = “AI ko backend ke through control karna”

// 3️⃣ RAG = GOLD SKILL 🥇

// High salary ka main reason yahi hai.

// Seekho:

// Text → Embeddings
// Vector DB:
// FAISS (local)
// Pinecone / Weaviate
// Chunking strategies
// Hybrid search (keyword + vector)

// 🔑 Real use:

// Company ke internal data pe chatbot

// 4️⃣ AI Security & Cost Control (VERY RARE SKILL)

// 90% devs yaha weak hote hain.

// Seekho:
// Prompt injection prevention
// Input sanitization
// PII masking
// Token usage optimization
// Caching LLM responses
// 💰 Companies ko paise bachane wale AI devs chahiye.

// 5️⃣ AI System Design (Senior-level skill)

// Interview me game changer 🎯

// Topics:

// LLM latency handling
// Async job queues (BullMQ)
// Fallback models
// Observability (logs, traces)
// Model versioning

// 🧩 Tumhare liye PERFECT Project Ideas
// 🚀 Project 1: AI Support Agent

// Node.js backend

// RAG on company docs

// Auth + rate limits

// Admin panel for prompts

// 🚀 Project 2: AI Resume Screener

// Upload PDFs

// Embeddings + scoring

// Cost-efficient pipeline

// 🚀 Project 3: AI Code Review Bot

// GitHub PR → LLM

// Rule-based + AI output

// Hallucination control

// 🧠 Tech Stack (Resume-Ready)
// Node.js / TypeScript
// Fastify / Express
// LLM APIs (OpenAI / OSS)
// LangChain.js
// Vector DB (FAISS / Pinecone)
// Redis (cache)
// Docker
// AWS (Lambda / ECS)

// ******************* AI Concepts ********************//

// Topic	                    Why it exists

// LLMs	                       Add intelligence to backend
// Tokens	                 Control cost & speed
// Context window	            Manage memory
// Creativity	                   Control randomness
// Embeddings	                 Search by meaning
// Vector DB	                   Store AI memory
// RAG	                          Use real data safely
// AI Security	                     Prevent misuse
// Monitoring	                 Control quality & cost
// Prompt versioning	         Stable production AI


// ** LangChain Framework **


Read and explored the official LangChain documentation

- Understood what LangChain is and why it’s used for building LLM-powered applications

- Performed R&D on configuring LangChain in Node.js

- Learned how to wrap and integrate different LLM providers (OpenAI, Anthropic, etc.) using LangChain

- Gained an overview of LangChain architecture and execution flow

- Studied Chains for sequential and conditional LLM workflows

- Learned about Prompt Templates and dynamic prompt construction

- Understood differences between LLM models vs Chat models and their usage patterns

- Gained an overview of Agents and how they decide which tool/action to invoke

- Studied Tools and external API integrations

- Learned about Memory concepts:-

~ Conversation memory
~ Buffer memory
~ Vector-based memory

- Gained an overview of Retrieval-Augmented Generation (RAG) using LangChain

- Understood Document Loaders for ingesting PDFs, text files, and web data

- Studied Text Splitters and chunking strategies

- Learned about Embeddings and vector representations

- Gained an overview of Vector Stores (FAISS, Pinecone, Chroma, etc.)

- Understood Callbacks & Tracing for logging, monitoring, and debugging

- Learned the Middleware concept, including prebuilt and custom middleware usage

- Gained an overview of Model Context Protocol (MCP) for exposing AI models to external tools and context

- Understood real-world use cases such as chatbots, search, summarization, and AI agents

// 1. What is LangChain?

- LangChain is a framework for building applications powered by Large Language Models (LLMs).
It helps you go beyond “one prompt → one response” and build real systems like chatbots, agents, RAG apps, and AI workflows.

Why LangChain exists

- LLMs alone are stateless and isolated
- Apps need memory, tools, data access, control flow
- LangChain provides these building blocks

// 2. Why LangChain is Used

LangChain helps you:

- Connect LLMs with external data
- Build multi-step reasoning workflows
- Create agents that take actions
- Add memory and context
- Debug and trace LLM calls

Used for:

- Chatbots
- Search engines
- Document Q&A
- AI agents
- Summarization pipelines

// 3. Configuring LangChain in Node.js

- LangChain supports JavaScript/TypeScript natively.

Typical setup:

- Install langchain
- Configure API keys (OpenAI, Anthropic, etc.)
- Create LLM or ChatModel instances
- Build chains, agents, or RAG pipelines

Node.js is commonly used for:

- Web apps
- APIs
- Serverless functions

// 4. LLM Providers Integration

- LangChain acts as a wrapper layer over multiple models.

Supported providers:

- OpenAI (GPT models)
- Anthropic (Claude)
- Google (Gemini / PaLM)
- Open-source models (via HuggingFace, Ollama)

Benefit
→ Switch models without rewriting your entire app.

// 5. LangChain Architecture & Execution Flow

High-level flow:

User Input
 → Prompt Template
 → LLM / Chat Model
 → Chain / Agent Logic
 → Tools / Memory / Retriever
 → Final Output


LangChain is modular:

You plug components together like Lego blocks

// 6. Chains

- Chains define how multiple steps are executed.

Types of Chains

- Simple Chain: Prompt → LLM → Output
- Sequential Chain: Output of one step feeds the next
- Conditional Chain: Logic decides next step

Use case

- Summarization → analysis → final answer
- Multi-step reasoning

// 7. Prompt Templates

- Prompt Templates allow dynamic prompt construction.

Example idea:

- Instead of hardcoding prompts
- You pass variables like {topic}, {context}

Benefits:

- Reusable prompts
- Cleaner code
- Easier experimentation

// 8. LLM Models vs Chat Models
- LLM (Text Completion)

Input: plain text

Output: plain text

Example: “Summarize this paragraph”

- Chat Models

- Message-based (system, user, assistant)
- Better for conversations
- Supports memory and roles
- Rule of thumb
- Use Chat Models for chatbots & agents
- Use LLMs for simple text tasks

// 9. Agents

- Agents are decision-makers.

Instead of following a fixed chain:

- Agent looks at the user input
- Decides which tool to use
- Executes actions dynamically

Example:

“Search this PDF, then summarize it, then email me”

The agent figures out the steps.

// 10. Tools

- Tools allow LLMs to interact with the outside world.

Examples:

- Search APIs
- Database queries
- File readers
- Calculators
- Web requests
- Agents use tools to act, not just talk.

// 11. Memory

- Memory lets the LLM remember past interactions.

Types of Memory:-

- Conversation Buffer Memory
Stores full chat history

- Summary Memory
Stores compressed conversation summary

- Vector-based Memory
Stores embeddings for semantic recall

Used in:

- Chatbots
- Assistants
- Long conversations

// 12. Retrieval-Augmented Generation (RAG)

- RAG combines:

Retrieval (fetch relevant data)
Generation (LLM response)

Flow:

User Question
 → Retrieve relevant documents
 → Inject into prompt
 → LLM answers using retrieved context


Why RAG?

- Reduces hallucinations
- Uses private or up-to-date data
- No model retraining needed

// 13. Document Loaders

- Document Loaders ingest raw data into LangChain.

Supported sources:

- PDFs
- Text files
- Word docs
- Web pages
- Databases

They convert data into a standard Document format.

// 14. Text Splitters

- LLMs have context limits.

Text splitters:

- Break large documents into chunks
- Maintain semantic meaning

Common strategies:

- Fixed size
- Recursive splitting
- Overlapping chunks
- Essential for RAG pipelines.

// 15. Embeddings

- Embeddings convert text into numerical vectors.

Purpose:

- Measure semantic similarity
- Enable search over meaning, not keywords

Used in:

- RAG
- Semantic search
- Memory systems

// 16. Vector Stores

- Vector stores store embeddings and allow fast similarity search.

Popular options:

- FAISS – local, fast
- Pinecone – managed cloud
- Chroma – lightweight, open-source
- Vector store = brain for your AI app.

// 17. Callbacks & Tracing

- Callbacks let you:

- Log inputs/outputs
- Measure latency
- Debug failures
- Monitor token usage
- Tracing tools help visualize:
- Chain execution
- Agent decisions
- Tool calls
- Very useful in production.

// 18. Middleware

- Middleware sits between requests and execution.

Used for:

- Logging
- Authentication
- Prompt modification
- Rate limiting

Can be:

- Prebuilt
- Custom

// 19. Model Context Protocol (MCP)

- MCP is a standard for:

- Exposing AI models
- Sharing tools and context externally

It allows:

- IDEs
- Apps
- External tools
- to safely interact with models and their capabilities.

// 20. Real-World Use Cases

- LangChain is used for:

- Chatbots & assistants
- Document Q&A systems
- Semantic search engines
- Automated summarization
- Autonomous AI agents
- Enterprise knowledge bases


// **Git Management**
1. Repo clone kiya ✅
- tecocraft@Amin-Deraiya tecocraft-site % git branch
* admin_panel
  develop
  main

- git checkout admin_panel
- tecocraft@Amin-Deraiya tecocraft-site % git status
On branch admin_panel
Your branch is up to date with 'origin/admin_panel'.

nothing to commit, working tree clean

**Pull Latest Changes**
git pull origin admin_panel

**Push Your Changes**
After editing files:

text
git add .
git commit -m "Your commit message here"
git push origin admin_panel

//  STASH 
2. admin_panel branch pe ho (git checkout admin_panel) ✅
3. Lekin aapne kuch files edit kar li hain (uncommitted changes)
4. Ab dusre developer ka latest code pull karna hai

**Step-by-Step Stash Use:**
# 1. Current changes ko safe karo
git stash push -m "Mera admin panel WIP"

# 2. Clean branch pe pull karo
git pull origin admin_panel

# 3. Apne changes wapas lao
git stash pop

# 4. Commit and push
git add .
git commit -m "Admin panel updates"
git push origin admin_panel

**Complete Example (Real Output):**
$ git status
On branch admin_panel
Changes not staged for commit:
  modified:   src/components/Dashboard.js
  modified:   prisma/schema.prisma

$ git stash push -m "Admin panel dashboard + prisma"
Saved working directory... stash@{0}

$ git pull origin admin_panel
Updating abc123..def456
Fast-forward

$ git stash pop
On branch admin_panel  
Changes not staged for commit:
  modified:   src/components/Dashboard.js
  modified:   prisma/schema.prisma
Dropped refs/stash@{0}

**Pehle Kya Tha (git status)**
text
Changes not staged for commit:
  modified:   src/components/Dashboard.js  
  modified:   prisma/schema.prisma
Matlab: Aapne 2 files mein changes kiye the, commit nahi kiya tha. Dirty working directory tha.

Step 1: git stash push -m "Admin panel dashboard + prisma"
text
Saved working directory... stash@{0}
Kya Hua:

Aapke 2 files ke changes temporary safe box mein daal diye gaye

✅ Working directory bilkul clean ho gaya

stash@{0} = Aapka first stash (stack ke top pe)

Step 2: git pull origin admin_panel
text
Updating abc123..def456
Fast-forward
Kya Hua:

Dusre developer ke latest changes aapke local mein aa gaye

Clean pull hua kyunki aapke changes stash mein the

abc123..def456 = Remote se naye commits aaye

Step 3: git stash pop
text
On branch admin_panel  
Changes not staged for commit:
  modified:   src/components/Dashboard.js
  modified:   prisma/schema.prisma
Dropped refs/stash@{0}
Kya Hua (Do kaam ek saath):

Apply: Aapke purane changes wapas aa gaye files mein

Pop: stash@{0} delete ho gaya list se

**Final Result = Perfect!**
text
Dusre developer ka code + Aapka code = Saath mein
Ab aap git add ., git commit, git push kar sakte ho safely.


* webmail
https://www.tecocraft.com/webmail
mailto:darshan.devani@tecocraft.com
Darshan@#@112

* Skype
https://web.skype.com/ or Skype software
mailto:darshan.devani@tecocraft.com
Darshan@#@112$

peterapps70@gmail.com
United@@999$$

ls -R  -> view folder structure
Compress File     -  gzip filename
Decompress File -  gunzip file.gz

* mongoDB Run :-  mongod --dbpath ~/mongodb-data
* PostgreSQL Start :-  pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/logfile start

Tecocraft new air
Teco@@2406

// Node.js PDF to DOCX Libraries :-

| Library                       | Text        | Tables      | Images      | OCR | Type                      |
| ----------------------------- | ----------- | ----------- | ----------- | --- | ------------------------- |
| pdf2docx-js                   | ⚠️ Basic    | ❌ Poor      | ⚠️ Basic    | ❌   | Free/Open-source        |
| @pdftron/pdfnet-node (Apryse) | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (Free trial)     |
| @nutrient-io/sdk-node         | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (Commercial)     |
| Aspose.PDF for Node.js        | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (Commercial)     |
| ConvertAPI (Node.js SDK)      | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (250 free/month) |
| Zamzar API                    | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (Free tier)      |
| libreoffice-convert + pdf-lib | ⚠️ Basic    | ⚠️ Basic    | ✅ Good      | ❌   | Free/Open-source        |

// Python PDF to DOCX Libraries :-

| Library                      | Text        | Tables      | Images      | OCR | Type                      |
| ---------------------------- | ----------- | ----------- | ----------- | --- | ---------------------     |
| pdf2docx                     | ✅ Excellent | ✅ Excellent | ✅ Good      | ❌   | Free/Open-source      |
| PyMuPDF (fitz) + python-docx | ✅ Good      | ⚠️ Basic    | ✅ Good      | ❌   | Free/Open-source       | 
| pdfplumber + python-docx     | ✅ Good      | ✅ Excellent | ❌ None      | ❌   | Free/Open-source      |
| Camelot + python-docx        | ⚠️ Basic    | ✅ Excellent | ❌ None      | ❌   | Free/Open-source       |
| IronPDF for Python           | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (Commercial)     |
| Aspose.PDF for Python        | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (Commercial)     |
| Aspose.Words for Python      | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (Commercial)     |
| GroupDocs.Conversion Cloud   | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (Free trial)     |
| ConvertAPI (Python SDK)      | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (250 free/month) |
| Zamzar API                   | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅   | Paid (Free tier)      |