const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

// MySQL database connection
const mysql = require('mysql');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydatabase"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL database!");

  // Fetch all users from 'user' table
  con.query("SELECT * FROM user", function (err, result, fields) {
    if (err) throw err;
    console.log("Data from 'user' table:", result);
  });
});

// Define the correct path to the web project directory
const projectPath = 'C:/Users/mamud/Documents/GitHub/3DWebGame/CMP5360 Web Game Development/Session 1/Web Project';

// Serve static files (CSS, images, JavaScript, etc.) from the web project directory
app.use(express.static(path.resolve(projectPath)));

// Serve HomePage.html as the default page
app.get('/', (req, res) => {
  res.sendFile(path.resolve(projectPath, 'HomePage.html'));
});

// Additional routes
app.get('/some', (req, res) => {
  res.send('Change a word!');
});

app.get('/test', (req, res) => {
  res.send('This is a test page');
});

// Catch-all route for 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(projectPath, '404.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
