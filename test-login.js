const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'arham@codeiu.in', 
      password: 'password'
    });
    process.stdout.write(`${JSON.stringify(res.headers, null, 2)}\n`);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
