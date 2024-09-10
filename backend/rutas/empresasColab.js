const express = require('express');
const router = express.Router();
const connection = require('../database');

// GET: Obtener un colaborador por su id_colaborador con el número de empresas a las que pertenece
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        c.id, c.nombre_completo, c.edad, c.telefono, c.correo,
        e.id AS empresa_id, e.nombre_comercial, e.razon_social, e.telefono AS empresa_telefono,
        p.nombre AS pais_nombre, d.nombre AS departamento_nombre, m.nombre AS municipio_nombre
      FROM colaboradores AS c
      INNER JOIN colaboradores_empresas AS ce ON c.id = ce.colaborador_id
      INNER JOIN empresas AS e ON ce.empresa_id = e.id
      LEFT JOIN paises AS p ON e.pais_id = p.id
      LEFT JOIN departamentos AS d ON e.departamento_id = d.id
      LEFT JOIN municipios AS m ON e.municipio_id = m.id
      WHERE c.id = ?
    `;

    connection.query(query, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error al obtener el colaborador y sus empresas', error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Empresas no encontradas para el colaborador' });
      }

      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Error inesperado en la consulta', error: error.message });
  }
});





// POST: Asignar un colaborador a una empresa
router.post('/asignar', async (req, res) => {
  try {
    const { colaborador_id, empresa_id } = req.body;

    const checkQuery = `
      SELECT
        (SELECT COUNT(*) FROM colaboradores WHERE id = ?) AS colaborador_exists,
        (SELECT COUNT(*) FROM empresas WHERE id = ?) AS empresa_exists,
        (SELECT COUNT(*) FROM colaboradores_empresas WHERE colaborador_id = ? AND empresa_id = ?) AS relacion_exists
    `;
    connection.query(checkQuery, [colaborador_id, empresa_id, colaborador_id, empresa_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error al verificar IDs', error: err.message });
      }

      const { colaborador_exists, empresa_exists, relacion_exists } = results[0];

      if (!colaborador_exists || !empresa_exists) {
        return res.status(400).json({ message: 'Colaborador o empresa no válidos' });
      }

      if (relacion_exists > 0) {
        return res.status(400).json({ message: 'El colaborador ya está asignado a esta empresa.' });
      }

      const insertQuery = 'INSERT INTO colaboradores_empresas (colaborador_id, empresa_id) VALUES (?, ?)';
      connection.query(insertQuery, [colaborador_id, empresa_id], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error al asignar colaborador a empresa', error: err.message });
        }
        res.json({ message: 'Colaborador asignado a la empresa con éxito' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error inesperado', error: error.message });
  }
});


// PUT: Actualizar la relación de un colaborador con una empresa
router.put('/actualizar/:colaborador_id', async (req, res) => {
  try {
    const { empresa_id } = req.body;
    const { colaborador_id } = req.params;

    const updateQuery = 'UPDATE colaboradores_empresas SET empresa_id = ? WHERE colaborador_id = ?';
    connection.query(updateQuery, [empresa_id, colaborador_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error al actualizar la relación', error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Relación no encontrada' });
      }
      res.json({ message: 'Relación actualizada con éxito' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error inesperado', error: error.message });
  }
});

// DELETE: Desasignar un colaborador de una empresa
router.delete('/desasignar', async (req, res) => {
  try {
    const { colaborador_id, empresa_id } = req.body;

    const deleteQuery = 'DELETE FROM colaboradores_empresas WHERE colaborador_id = ? AND empresa_id = ?';
    connection.query(deleteQuery, [colaborador_id, empresa_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error al desasignar colaborador de la empresa', error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Relación no encontrada' });
      }
      res.json({ message: 'Relación desasignada con éxito' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error inesperado', error: error.message });
  }
});


module.exports = router;
