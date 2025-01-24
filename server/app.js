const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const { connectPassport } = require('./passport.js');
const { getRoutes } = require('./routes');
const app = express();
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT || 3000;

connectPassport();


app.use(session({ secret: process.env.SECRET_KEY, resave: true, saveUninitialized: true }));


app.use(passport.initialize());
app.use(passport.session());



getRoutes(app);
const publicPath = path.join(__dirname, '../regal/');
app.use(express.static(publicPath));

app.get("/", (req, res) => {

  res.sendFile(path.join(publicPath, 'index.html'));
  console.log(publicPath,"index.html")
});
app.use((req, res) => {
  res.status(404).sendFile(path.join(publicPath, '404.html'));
});

app.listen(port, () => {
  console.log(`La aplicación está en funcionamiento en http://localhost:${port}`);
});

process.on('exit', (code) => {
  console.log(`El proceso está saliendo con el código: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});
