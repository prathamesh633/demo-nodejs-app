require('dotenv').config(); // add at top
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true })); // parse form data
app.use(express.static(path.join(__dirname, 'public'))); // serve static files

// --- MySQL Connection ---
const connection = mysql.createConnection({
  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,        // demo-user
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function connectWithRetry() {
  connection.connect((err) => {
    if (err) {
      console.log('⚠️ MySQL not ready yet, retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('✅ Connected to MySQL successfully!');
    }
  });
}

connectWithRetry();

connection.on('error', (err) => {
  console.error('⚠️ MySQL error:', err.message);
});

// --- Initialize DB Table ---
const initTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  age INT,
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

connection.query(initTableSQL, (err) => {
  if (err) console.error('❌ Error creating table:', err.message);
  else console.log('✅ Table "users" is ready');
});

// --- Routes ---
// Home route serves the form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Handle form submission
app.post('/submit', (req, res) => {
  const { name, age, city } = req.body;
  if (!name || !age || !city) return res.send('All fields are required');

  const sql = 'INSERT INTO users (name, age, city) VALUES (?, ?, ?)';
  connection.query(sql, [name, age, city], (err, result) => {
    if (err) return res.send('Database error: ' + err.message);
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Added</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <meta http-equiv="refresh" content="5; url=/" />
  <style>html{color-scheme: light dark}</style>
   </head>
 <body>
  <div class="min-h-screen relative">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div id="bgLayer" class="h-full w-full bg-cover bg-center transition-opacity duration-700 opacity-100"></div>
      <div id="bgLayerNext" class="h-full w-full bg-cover bg-center absolute inset-0 transition-opacity duration-700 opacity-0"></div>
      <div class="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
    </div>

    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white shadow-xl shadow-slate-200/70 ring-1 ring-slate-900/5 rounded-xl overflow-hidden">
          <div class="p-6 text-center space-y-3">
          <div class="mx-auto h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.06-1.06L10.5 12.44l-1.49-1.49a.75.75 0 1 0-1.06 1.06l2.02 2.02c.293.293.767.293 1.06 0l4.68-4.62Z" clip-rule="evenodd"/></svg>
          </div>
          <h1 class="text-2xl font-semibold text-slate-900">User added successfully</h1>
          <p class="text-slate-600">Name: <span class="font-medium">${name}</span> • Age: <span class="font-medium">${age}</span> • City: <span class="font-medium">${city}</span></p>
          <p class="text-xs text-slate-500">Redirecting to the form in 5 seconds…</p>
        </div>
          <div class="bg-slate-50 px-6 py-4 flex items-center justify-between">
            <a href="/" class="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2">Back to Form</a>
            <a href="/users" class="text-indigo-600 hover:text-indigo-700 font-medium">View All Users</a>
          </div>
        </div>
        <p class="text-center text-xs text-slate-500 mt-6">Node.js • Express • MySQL</p>
      </div>
    </div>
  </div>

  <script>
    (function(){
      var images = [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop'
      ];
      var i = 0;
      var layer = document.getElementById('bgLayer');
      var next = document.getElementById('bgLayerNext');
      function setBg(el, url){ el.style.backgroundImage = 'url(' + url + ')'; }
      function cycle(){
        var nextIdx = (i + 1) % images.length;
        setBg(next, images[nextIdx]);
        next.classList.remove('opacity-0');
        next.classList.add('opacity-100');
        layer.classList.remove('opacity-100');
        layer.classList.add('opacity-0');
        var tmp = layer; layer = next; next = tmp; i = nextIdx;
      }
      setBg(layer, images[0]);
      setInterval(cycle, 8000);
    })();
  </script>
 </body>
 </html>
    `);
  });
});

// API to view all users (optional for Postman)
app.get('/users', (req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send('Database error: ' + err.message);
    res.json(results);
  });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
