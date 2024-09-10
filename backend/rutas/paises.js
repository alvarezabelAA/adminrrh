const express = require('express');
const router = express.Router();
const connection = require('../database');

// GET: Obtener todos los países
router.get('/', async (req, res) => {
  try {
      const query = `
          SELECT p.*, COUNT(d.id) as num_counter
          FROM paises p
          LEFT JOIN departamentos d ON p.id = d.pais_id
          GROUP BY p.id;
      `;
      connection.query(query, (err, results) => {
          if (err) {
              return res.status(500).json({ message: 'Error al obtener los países', error: err.message });
          }
          res.json(results);
      });
  } catch (error) {
      res.status(500).json({ message: 'Error inesperado en la consulta', error: error.message });
  }
});

// POST: Agregar un país
router.post('/', async (req, res) => {
    try {
        const { nombre } = req.body;

        // Validar que el nombre no esté vacío
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ message: 'El nombre del país es obligatorio.' });
        }

        const query = 'INSERT INTO paises (nombre) VALUES (?)';
        connection.query(query, [nombre], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error al insertar el país', error: err.message });
            }
            res.json({ id: results.insertId, nombre });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error inesperado al insertar el país', error: error.message });
    }
});

// PUT: Actualizar un país
router.put('/:id', async (req, res) => {
    try {
        const { nombre } = req.body;
        const { id } = req.params;

        // Validar que el nombre no esté vacío
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ message: 'El nombre del país es obligatorio.' });
        }

        const query = 'UPDATE paises SET nombre = ? WHERE id = ?';
        connection.query(query, [nombre, id], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error al actualizar el país', error: err.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'País no encontrado' });
            }
            res.json({ message: 'País actualizado con éxito', id, nombre });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error inesperado al actualizar el país', error: error.message });
    }
});

// DELETE: Eliminar un país
router.delete('/:id', async (req, res) => {
  try {
      const { id } = req.params;

      const query = 'DELETE FROM paises WHERE id = ?';
      connection.query(query, [id], (err, results) => {
          if (err) {
              // Manejar error de referencia de clave externa (error 1451)
              if (err.errno === 1451) {
                  return res.status(400).json({
                      message: 'No se puede eliminar el país porque está relacionado con otras entidades.',
                      error: err.sqlMessage
                  });
              }
              return res.status(500).json({
                  message: 'Error al eliminar el país',
                  error: err.message
              });
          }
          if (results.affectedRows === 0) {
              return res.status(404).json({ message: 'País no encontrado' });
          }
          res.json({ message: 'País eliminado con éxito', id });
      });
  } catch (error) {
      res.status(500).json({
          message: 'Error inesperado al eliminar el país',
          error: error.message
      });
  }
});


module.exports = router;
