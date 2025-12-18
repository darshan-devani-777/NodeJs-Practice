// HTTP MODULE :-

const http = require('http');

// 1ST METHOD :- CREATE SERVER
// const server = http.createServer((req,res) =>{
//        res.end('Welcome to Local Server...');
// });

// 2ND METHOD :- CREATE SERVER
// const server = http.createServer();
// server.on('request',(req,res) =>{
//     res.write('<h1 style = "color:red" >Hello...</h1>');
//     res.end('<h1 style = "color:black" >Welcome To Local Server...</h1>');
// });

server.listen(7777,() =>{
    console.log('Server Start at http://localhost:7777');
});



