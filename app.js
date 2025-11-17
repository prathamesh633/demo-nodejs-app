require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Graceful shutdown handling
let server;
let pool;

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  shutdown();
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  shutdown();
});

function shutdown() {
  if (server) {
    server.close(async () => {
      console.log('📡 HTTP server closed');
      if (pool) {
        try {
          await pool.end();
          console.log('🗄️  Database pool closed');
          process.exit(0);
        } catch (err) {
          console.error('❌ Error closing pool:', err.message);
          process.exit(1);
        }
      } else {
        process.exit(0);
      }
    });
  } else {
    process.exit(0);
  }
}

// --- Middleware ---
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging middleware
app.use((req, res, next) => {
  if (NODE_ENV === 'development') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Application error:', err);
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// --- MySQL Connection Pool ---
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: NODE_ENV === 'production' ? 3 : 2, // Reduced for t2.micro
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

pool = mysql.createPool(dbConfig);

async function testPoolConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Connected to MySQL successfully!');
    initializeDatabase();
  } catch (err) {
    console.error('⚠️ MySQL pool connection failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('🔄 Retrying MySQL connection in 5 seconds...');
      setTimeout(testPoolConnection, 5000);
    } else {
      console.error('❌ Fatal database error:', err);
      process.exit(1);
    }
  }
}

testPoolConnection();

// --- Initialize DB Table ---
async function initializeDatabase() {
  const initTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_city (city)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

  try {
    await pool.execute(initTableSQL);
    console.log('✅ Table "users" is ready');
  } catch (err) {
    console.error('❌ Error creating table:', err.message);
  }
}

// --- Routes ---
// Home route serves the form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Handle form submission
app.post('/submit', async (req, res) => {
  const { name, age, city } = req.body;
  
  // Input validation
  if (!name || !age || !city) {
    return res.status(400).json({
      error: 'All fields are required',
      missing: { name: !name, age: !age, city: !city }
    });
  }
  
  // Sanitize inputs
  const sanitizedName = name.trim().substring(0, 100);
  const sanitizedAge = parseInt(age);
  const sanitizedCity = city.trim().substring(0, 100);
  
  // Enhanced validation
  if (sanitizedName.length === 0 || sanitizedName.length > 100) {
    return res.status(400).json({
      error: 'Name must be between 1 and 100 characters'
    });
  }
  
  if (isNaN(sanitizedAge) || sanitizedAge < 0 || sanitizedAge > 120) {
    return res.status(400).json({
      error: 'Age must be a positive integer between 0 and 120'
    });
  }
  
  if (sanitizedCity.length === 0 || sanitizedCity.length > 100) {
    return res.status(400).json({
      error: 'City must be between 1 and 100 characters'
    });
  }

  try {
    const sql = 'INSERT INTO users (name, age, city) VALUES (?, ?, ?)';
    const [result] = await pool.execute(sql, [sanitizedName, sanitizedAge, sanitizedCity]);
    
    console.log(`✅ User added: ${sanitizedName}, ${sanitizedAge}, ${sanitizedCity}`);
    
    // Return JSON response for API calls, HTML for form submissions
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.status(201).json({
        success: true,
        user: { id: result.insertId, name: sanitizedName, age: sanitizedAge, city: sanitizedCity }
      });
    } else {
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
          <p class="text-slate-600">Name: <span class="font-medium">${sanitizedName}</span> • Age: <span class="font-medium">${sanitizedAge}</span> • City: <span class="font-medium">${sanitizedCity}</span></p>
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
  <\/script>
 </body>
 </html>
    `);
    }
  } catch (err) {
    console.error('❌ Database error:', err);
    return res.status(500).json({
      error: 'Database error: ' + (NODE_ENV === 'production' ? 'Failed to save user' : err.message)
    });
  }
});

// API to view all users
app.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Reduced from 50 to 20, max 50
  const offset = (page - 1) * limit;
  
  try {
    // Count total users
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;
    
    // Get paginated users
    const sql = `SELECT * FROM users ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const [results] = await pool.execute(sql);
    
    res.json({
      users: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({
      error: 'Database error: ' + (NODE_ENV === 'production' ? 'Failed to fetch users' : err.message)
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    database: 'connected'
  };
  
  // Check database connection
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json(health);
  } catch (err) {
    health.status = 'error';
    health.database = 'disconnected';
    res.status(503).json(health);
  }
});

// Start server
server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Application: http://localhost:${PORT}/`);
});
