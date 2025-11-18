const http = require('http');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const API_GATEWAY = 'http://localhost:8080';
const USER_SERVICE = 'http://localhost:3000';
const PRODUCT_SERVICE = 'http://localhost:4000';

// Helper function to make HTTP requests
function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test function
async function testEndpoint(method, url, data, description) {
  try {
    console.log(`\n${colors.blue}Testing: ${description}${colors.reset}`);
    console.log(`URL: ${url}`);
    
    const response = await makeRequest(method, url, data);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`${colors.green}✓ Success (HTTP ${response.statusCode})${colors.reset}`);
      try {
        const json = JSON.parse(response.body);
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log(response.body);
      }
      return true;
    } else {
      console.log(`${colors.red}✗ Failed (HTTP ${response.statusCode})${colors.reset}`);
      console.log(response.body);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}Microservices API Testing${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}\n`);

  // Check if services are running
  try {
    await makeRequest('GET', `${API_GATEWAY}/health`);
    console.log(`${colors.green}Services are running!${colors.reset}\n`);
  } catch (error) {
    console.log(`${colors.red}Error: Services are not running!${colors.reset}`);
    console.log(`${colors.yellow}Please start services using: docker-compose up${colors.reset}`);
    process.exit(1);
  }

  // Test API Gateway Health
  await testEndpoint('GET', `${API_GATEWAY}/health`, null, 'API Gateway Health Check');

  // Test User Service via Gateway
  console.log(`\n${colors.blue}=== Testing User Service via API Gateway ===${colors.reset}`);
  await testEndpoint('POST', `${API_GATEWAY}/api/users/create`, 
    { name: 'Test User', email: 'test@example.com' },
    'Create User via Gateway');
  
  await testEndpoint('GET', `${API_GATEWAY}/api/users/fetch`, null, 'Fetch All Users via Gateway');

  // Test Product Service via Gateway
  console.log(`\n${colors.blue}=== Testing Product Service via API Gateway ===${colors.reset}`);
  await testEndpoint('POST', `${API_GATEWAY}/api/products/create`,
    { name: 'Test Product', price: 1000, userId: 1 },
    'Create Product via Gateway');
  
  await testEndpoint('GET', `${API_GATEWAY}/api/products/fetch`, null, 'Fetch All Products via Gateway');

  // Test Direct Service Endpoints
  console.log(`\n${colors.blue}=== Testing Direct Service Endpoints ===${colors.reset}`);
  
  try {
    await testEndpoint('GET', `${USER_SERVICE}/fetch`, null, 'Fetch Users (Direct)');
  } catch (error) {
    console.log(`${colors.red}User Service not accessible directly${colors.reset}`);
  }

  try {
    await testEndpoint('GET', `${PRODUCT_SERVICE}/fetch`, null, 'Fetch Products (Direct)');
  } catch (error) {
    console.log(`${colors.red}Product Service not accessible directly${colors.reset}`);
  }

  console.log(`\n${colors.green}========================================${colors.reset}`);
  console.log(`${colors.green}Testing Complete!${colors.reset}`);
  console.log(`${colors.green}========================================${colors.reset}\n`);
}

// Run tests
runTests().catch(console.error);

