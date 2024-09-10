const express = require('express');
const router = express.Router();
const connection = require('../database');

// GET: Obtener todos los departamentos con el nombre del país
router.get('/', async (req, res) => {
  const { id_pais } = req.query;
  console.log(id_pais);
  try {
      let query = `
          SELECT d.id, d.nombre, d.pais_id, p.nombre AS pais_nombre, COUNT(m.id) AS num_counter
          FROM departamentos AS d
          JOIN paises AS p ON d.pais_id = p.id
          LEFT JOIN municipios AS m ON d.id = m.departamento_id
      `;

      if (id_pais) {
          query += ` WHERE d.pais_id = ?`;
      }

      query += ` GROUP BY d.id`;

      connection.query(query, [id_pais], (err, results) => {
          if (err) throw err;
          res.json(results);
      });
  } catch (error) {
      res.status(500).json({ message: 'Error en la consulta', error: error.message });
  }
});




// POST: Agregar un departamento
router.post('/', async (req, res) => {
  try {
      const { nombre, pais_id } = req.body;

      const checkCountryQuery = 'SELECT id FROM paises WHERE id = ?';
      connection.query(checkCountryQuery, [pais_id], (err, results) => {
          if (err) {
              return res.status(500).json({ message: 'Error en la verificación del país', error: err.message });
          }
          if (results.length === 0) {
              return res.status(400).json({ message: 'El país especificado no existe' });
          }

          const query = 'INSERT INTO departamentos (nombre, pais_id) VALUES (?, ?)';
          connection.query(query, [nombre, pais_id], (err, results) => {
              if (err) {
                  return res.status(500).json({ message: 'Error al insertar el departamento', error: err.message });
              }
              res.json({ id: results.insertId, nombre, pais_id });
          });
      });
  } catch (error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});


// PUT: Actualizar un departamento
router.put('/:id', async (req, res) => {
  try {
      const { nombre, pais_id } = req.body;
      const { id } = req.params;

      const checkCountryQuery = 'SELECT id FROM paises WHERE id = ?';
      console.log(id, nombre, pais_id);
      connection.query(checkCountryQuery, [pais_id], (err, countryResults) => {
          if (err) {
              return res.status(500).json({ message: 'Error verificando el país', error: err.message });
          }
          if (countryResults.length === 0) {
              return res.status(400).json({ message: 'El país especificado no existe' });
          }

          const query = 'UPDATE departamentos SET nombre = ?, pais_id = ? WHERE id = ?';
          console.log(query);
          connection.query(query, [nombre, pais_id, id], (err, results) => {
              if (err) throw err;
              if (results.affectedRows === 0) {
                  return res.status(404).json({ message: 'Departamento no encontrado' });
              }
              res.json({ message: 'Departamento actualizado con éxito', id, nombre, pais_id });
          });
      });
  } catch (error) {
      res.status(500).json({ message: 'Error actualizando el departamento', error: error.message });
  }
});


// DELETE: Eliminar un departamento
router.delete('/:id', async (req, res) => {
  try {
      const { id } = req.params;

      const query = 'DELETE FROM departamentos WHERE id = ?';
      connection.query(query, [id], (err, results) => {
          if (err) {
              if (err.errno === 1451) {
                  return res.status(400).json({
                      message: 'No se puede eliminar el departamento porque está relacionado con otras entidades.',
                      error: err.sqlMessage
                  });
              }
              return res.status(500).json({
                  message: 'Error al eliminar el departamento',
                  error: err.message
              });
          }
          if (results.affectedRows === 0) {
              return res.status(404).json({ message: 'Departamento no encontrado' });
          }
          res.json({ message: 'Departamento eliminado con éxito', id });
      });
  } catch (error) {
      res.status(500).json({
          message: 'Error inesperado al eliminar el departamento',
          error: error.message
      });
  }
});


module.exports = router;
