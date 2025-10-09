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
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
      <h2>✅ User added successfully!</h2>
      <p><a href="/">Go back to form</a></p>
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
