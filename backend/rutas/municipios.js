const express = require('express');
const router = express.Router();
const connection = require('../database');

// GET: Obtener todos los municipios con el nombre del departamento y país
router.get('/', async (req, res) => {
  const { id_pais, id_departamento } = req.query; // Obtener los parámetros de la consulta
  try {
      let query = `
          SELECT m.id, m.nombre, m.departamento_id, d.nombre AS departamento_nombre, p.nombre AS pais_nombre
          FROM municipios AS m
          JOIN departamentos AS d ON m.departamento_id = d.id
          JOIN paises AS p ON d.pais_id = p.id
      `;

      const queryParams = [];

      if (id_pais) {
          query += ` WHERE p.id = ?`;
          queryParams.push(id_pais);
      }

      if (id_departamento) {
          query += id_pais ? ` AND d.id = ?` : ` WHERE d.id = ?`;
          queryParams.push(id_departamento);
      }

      connection.query(query, queryParams, (err, results) => {
          if (err) throw err;
          res.json(results);
      });
  } catch (error) {
      res.status(500).json({ message: 'Error en la consulta', error: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
      const { nombre, departamento_id } = req.body;
      console.log(nombre, departamento_id);
      if (!nombre || nombre.length < 3) {
          return res.status(400).json({ message: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
      }
      const checkDepartmentQuery = 'SELECT id FROM departamentos WHERE id = ?';
      connection.query(checkDepartmentQuery, [departamento_id], (err, departmentResults) => {
          if (err) {
              return res.status(500).json({ message: 'Error verificando el departamento', error: err.message });
          }
          if (departmentResults.length === 0) {
              return res.status(400).json({ message: 'El departamento especificado no existe' });
          }
          const query = 'INSERT INTO municipios (nombre, departamento_id) VALUES (?, ?)';
          connection.query(query, [nombre, departamento_id], (err, results) => {
              if (err) throw err;
              res.json({ id: results.insertId, nombre, departamento_id });
          });
      });
  } catch (error) {
      res.status(500).json({ message: 'Error al insertar el municipio', error: error.message });
  }
});


// PUT: Actualizar un municipio
router.put('/:id', async (req, res) => {
  try {
      const { nombre, departamento_id } = req.body;
      const { id } = req.params;
      if (!nombre || nombre.length < 3) {
          return res.status(400).json({ message: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
      }
      const checkDepartmentQuery = 'SELECT id FROM departamentos WHERE id = ?';
      connection.query(checkDepartmentQuery, [departamento_id], (err, departmentResults) => {
          if (err) {
              return res.status(500).json({ message: 'Error verificando el departamento', error: err.message });
          }
          if (departmentResults.length === 0) {
              return res.status(400).json({ message: 'El departamento especificado no existe' });
          }
          const query = 'UPDATE municipios SET nombre = ?, departamento_id = ? WHERE id = ?';
          connection.query(query, [nombre, departamento_id, id], (err, results) => {
              if (err) throw err;
              if (results.affectedRows === 0) {
                  return res.status(404).json({ message: 'Municipio no encontrado' });
              }
              res.json({ message: 'Municipio actualizado con éxito', id, nombre, departamento_id });
          });
      });
  } catch (error) {
      res.status(500).json({ message: 'Error actualizando el municipio', error: error.message });
  }
});


// DELETE: Eliminar un municipio
router.delete('/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const query = 'DELETE FROM municipios WHERE id = ?';
      connection.query(query, [id], (err, results) => {
          if (err) {
              if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                  return res.status(400).json({
                      message: 'No se puede eliminar el municipio porque está siendo referenciado en otras tablas.',
                      error: err.sqlMessage
                  });
              }
              return res.status(500).json({
                  message: 'Error eliminando el municipio.',
                  error: err.message
              });
          }
          if (results.affectedRows === 0) {
              return res.status(404).json({ message: 'Municipio no encontrado' });
          }
          res.json({ message: 'Municipio eliminado con éxito', id });
      });
  } catch (error) {
      res.status(500).json({ message: 'Error inesperado al eliminar el municipio.', error: error.message });
  }
});


module.exports = router;
