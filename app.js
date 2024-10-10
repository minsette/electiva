const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// Configurar body-parser para manejar datos POST
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar express-session para manejar sesiones
app.use(session({
  secret: 'tu_secreto',
  resave: false,
  saveUninitialized: true
}));

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'data'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos como id ' + db.threadId);
});

// Ruta para manejar el registro de usuarios
app.post('/register', (req, res) => {
  const { nombre_completo, cedula, correo, nombre_usuario, contrasena } = req.body;

  console.log('Datos de registro recibidos:');
  console.log(`Nombre completo: ${nombre_completo}`);
  console.log(`Cédula: ${cedula}`);
  console.log(`Correo: ${correo}`);
  console.log(`Nombre de usuario: ${nombre_usuario}`);
  console.log(`Contraseña: ${contrasena}`);

  const sql = `INSERT INTO usuarios (nombre_completo, cedula, correo, nombre_usuario, contrasena) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [nombre_completo, cedula, correo, nombre_usuario, contrasena], (err, result) => {
    if (err) {
      console.error('Error insertando datos en la base de datos:', err.stack);
      res.status(500).send('Error al registrar el usuario.');
      return;
    }
    console.log('Usuario registrado con éxito:', result);
    res.redirect('/index.html'); // Redirigir a la página de inicio
  });
});

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  const sql = `SELECT * FROM usuarios WHERE nombre_usuario = ? AND contrasena = ?`;
  db.query(sql, [nombre_usuario, contrasena], (err, results) => {
    if (err) {
      console.error('Error consultando la base de datos:', err.stack);
      res.status(500).send('Error al iniciar sesión.');
      return;
    }

    if (results.length > 0) {
      req.session.user = results[0];
      res.redirect('/compra'); // Redirigir a la página de compra
    } else {
      res.status(401).send('Nombre de usuario o contraseña incorrectos.');
    }
  });
});

// Ruta para manejar el cierre de sesión
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión.');
    }
    res.redirect('/index.html');
  });
});

// Ruta para manejar la página de compra
app.get('/compra', (req, res) => {
  if (!req.session.user) {
    res.status(401).send('No has iniciado sesión.');
    return;
  }
  res.sendFile(path.join(__dirname, 'public', 'compra.html'));
});

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Definir una ruta
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});