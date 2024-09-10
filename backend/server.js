const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// // Rutas
const paisesRoutes = require('./rutas/paises');
const departamentosRoutes = require('./rutas/departamentos');
const municipiosRoutes = require('./rutas/municipios');
const empresasRoutes = require('./rutas/empresas');
const colaboradoresRoutes = require('./rutas/colaboradores');
const empresasColab = require('./rutas/empresasColab');

// // Usar las rutas
app.use('/api/paises', paisesRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/municipios', municipiosRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/empresasColab', empresasColab);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
