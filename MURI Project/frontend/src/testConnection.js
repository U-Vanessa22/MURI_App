// frontend/src/testConnection.js
async function testBackendConnection() {
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    
    console.log('✅ Backend is running:', data);
    
    // Test auth endpoints
    const testUser = {
      email: 'test@example.com',
      password: 'Test@1234'
    };
    
    const loginResponse = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (loginResponse.ok) {
      console.log('✅ Auth endpoint is working');
    } else {
      console.log('⚠️  Auth endpoint returned:', loginResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Cannot connect to backend:', error);
  }
}

// Run the test
testBackendConnection();