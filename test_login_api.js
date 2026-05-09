const axios = require('axios');

const testLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/users/login', {
      email: 'admin@gmail.com',
      password: 'admin12345678'
    });
    console.log('Đăng nhập thành công!');
    console.log('Dữ liệu trả về:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log('Đăng nhập thất bại!');
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
    } else {
      console.log('Không thể kết nối tới server:', error.message);
    }
  }
};

testLogin();
