<!-- v1 Users -->
curl -s http://localhost:3000/v1/users | jq

<!-- v2 Users -->
curl -s http://localhost:3000/v2/users | jq

<!-- Neutral Routes -->
GET → /v1/status
curl -s http://localhost:3000/v1/status | jq

GET → /v2/status
curl -s http://localhost:3000/v2/status | jq

GET → /status
curl -s http://localhost:3000/status | jq
