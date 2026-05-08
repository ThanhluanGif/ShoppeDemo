const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testAuth = async () => {
  try {
    console.log('Testing Registration...');
    const regRes = await axios.post(`${API_URL}/users`, {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'password123'
    });
    console.log('Registration Success:', regRes.data.username);

    const email = regRes.data.email;

    console.log('Testing Login...');
    const loginRes = await axios.post(`${API_URL}/users/login`, {
      email,
      password: 'password123'
    });
    console.log('Login Success:', loginRes.data.username);
    console.log('Token received:', !!loginRes.data.token);

  } catch (error) {
    console.error('Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testAuth();
