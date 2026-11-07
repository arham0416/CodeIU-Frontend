const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ headers: res.headers, statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  const loginData = JSON.stringify({ email: 'arhamz@codeiu.in', password: 'password' }); // doesn't matter if it fails
  const loginRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
  });
  process.stdout.write(`Login Status: ${loginRes.statusCode}\n`);
  const cookies = loginRes.headers['set-cookie'];
  process.stdout.write("Login Cookies:\n");
  if (cookies) cookies.forEach((c) => process.stdout.write(`${c}\n`));

  const cookieString = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

  const logoutRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/v1/auth/logout', method: 'POST',
    headers: { 'Cookie': cookieString }
  });
  process.stdout.write(`Logout Status: ${logoutRes.statusCode}\n`);
  const logoutCookies = logoutRes.headers['set-cookie'];
  process.stdout.write("Logout Cookies:\n");
  if (logoutCookies) logoutCookies.forEach((c) => process.stdout.write(`${c}\n`));

  const checkRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/v1/auth/check-Auth?t=123', method: 'GET',
    headers: { 'Cookie': cookieString, 'Cache-Control': 'no-cache' }
  });
  process.stdout.write(`CheckAuth Status (using original login cookie): ${checkRes.statusCode}\n`);
}
run();
