const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydatabase"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("SELECT * FROM user", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

// Serve static files from the 'public' directory
app.use(express.static(path.resolve('C:/Users/s23149743/GitHub/3DWebGame/CMP5360 Web Game Development/Session 1/Web Project')));

// Serve HomePage.html as the default page
app.get('/', (req, res) => {
  res.sendFile(path.resolve('C:/Users/s23149743/GitHub/3DWebGame/CMP5360 Web Game Development/Session 1/Web Project/HomePage.html'));
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
  res.status(404).sendFile(path.resolve('C:/Users/s23149743/GitHub/3DWebGame/CMP5360 Web Game Development/Session 1/Web Project/404.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
