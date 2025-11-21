<!-- # CREATE -->
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}' | jq

<!-- # READ ALL -->
curl http://localhost:3000/users | jq

<!-- # READ ONE -->
curl http://localhost:3000/users/1 | jq

<!-- # UPDATE -->
curl -X PATCH http://localhost:3000/users/1 -H "Content-Type: application/json" \
  -d '{"name":"Updated"}' | jq

<!-- # DELETE -->
curl -X DELETE http://localhost:3000/users/1 | jq

<!-- Terminal Execution -->
-> Run main app - npm run start:dev
-> Open another terminal - execute above all queries
