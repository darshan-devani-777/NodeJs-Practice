// Fs - FILE SYSTEM :-

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.c');

// Open-File
// fs.open(filePath, (err, data) => {
//     if (err) {
//         return console.log(err);
//     }
//     console.log("File opened successfully");
// });

// Read-File
// fs.readFile(filePath , 'utf-8' , (err , data) => {
//     if(err) console.log(err);
//     else console.log(data);
// });

// Write-File
// fs.writeFile(filePath, 'Hello, this is a test message!', (err) => {
//     if (err) console.log("Error:", err);
//     else console.log('File Written Successfully!');
// });

// Append-File:- ( Add Text )
// fs.appendFile(filePath ,'...Okk',(err) =>{
//     if(err) console.log(err);
//     else console.log('File Append SuccessFully');
// });


