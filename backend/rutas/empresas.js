const express = require('express');
const router = express.Router();
const connection = require('../database');

// GET: Obtener todas las empresas
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT e.id, e.nombre_comercial, e.razon_social, e.nit, e.telefono, e.correo,
                   p.nombre AS pais, d.nombre AS departamento, m.nombre AS municipio
            FROM empresas AS e
            JOIN paises AS p ON e.pais_id = p.id
            JOIN departamentos AS d ON e.departamento_id = d.id
            JOIN municipios AS m ON e.municipio_id = m.id`;
        connection.query(query, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error al obtener las empresas', error: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en la consulta', error: error.message });
    }
});

// POST: Agregar una empresa
router.post('/', async (req, res) => {
    try {
        const { nombre_comercial, razon_social, nit, telefono, correo, pais_id, departamento_id, municipio_id } = req.body;

        // Validar campos requeridos
        if (!nombre_comercial || !razon_social || !nit || !telefono || !correo || !pais_id || !departamento_id || !municipio_id) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // Verificar que pais, departamento y municipio existen
        const checkRelationsQuery = `
            SELECT (SELECT COUNT(*) FROM paises WHERE id = ?) AS pais_exists,
                   (SELECT COUNT(*) FROM departamentos WHERE id = ?) AS departamento_exists,
                   (SELECT COUNT(*) FROM municipios WHERE id = ?) AS municipio_exists;
        `;
        connection.query(checkRelationsQuery, [pais_id, departamento_id, municipio_id], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error al validar las relaciones', error: err.message });
            }

            const { pais_exists, departamento_exists, municipio_exists } = results[0];
            if (!pais_exists || !departamento_exists || !municipio_exists) {
                return res.status(400).json({ message: 'País, departamento o municipio no válidos.' });
            }

            // Si las relaciones son válidas, insertar la empresa
            const query = `
                INSERT INTO empresas (nombre_comercial, razon_social, nit, telefono, correo, pais_id, departamento_id, municipio_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            connection.query(query, [nombre_comercial, razon_social, nit, telefono, correo, pais_id, departamento_id, municipio_id], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al insertar la empresa', error: err.message });
                }
                res.json({ id: results.insertId, nombre_comercial, razon_social, nit, telefono, correo, pais_id, departamento_id, municipio_id });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al insertar la empresa', error: error.message });
    }
});

// PUT: Actualizar una empresa
router.put('/:id', async (req, res) => {
    try {
        const { nombre_comercial, razon_social, nit, telefono, correo, pais_id, departamento_id, municipio_id } = req.body;
        const { id } = req.params;

        // Validar campos requeridos
        if (!nombre_comercial || !razon_social || !nit || !telefono || !correo || !pais_id || !departamento_id || !municipio_id) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // Verificar que pais, departamento y municipio existen
        const checkRelationsQuery = `
            SELECT (SELECT COUNT(*) FROM paises WHERE id = ?) AS pais_exists,
                   (SELECT COUNT(*) FROM departamentos WHERE id = ?) AS departamento_exists,
                   (SELECT COUNT(*) FROM municipios WHERE id = ?) AS municipio_exists;
        `;
        connection.query(checkRelationsQuery, [pais_id, departamento_id, municipio_id], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error al validar las relaciones', error: err.message });
            }

            const { pais_exists, departamento_exists, municipio_exists } = results[0];
            if (!pais_exists || !departamento_exists || !municipio_exists) {
                return res.status(400).json({ message: 'País, departamento o municipio no válidos.' });
            }

            // Si las relaciones son válidas, actualizar la empresa
            const query = `
                UPDATE empresas SET nombre_comercial = ?, razon_social = ?, nit = ?, telefono = ?, correo = ?, pais_id = ?, departamento_id = ?, municipio_id = ?
                WHERE id = ?`;
            connection.query(query, [nombre_comercial, razon_social, nit, telefono, correo, pais_id, departamento_id, municipio_id, id], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al actualizar la empresa', error: err.message });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Empresa no encontrada' });
                }
                res.json({ message: 'Empresa actualizada con éxito', id, nombre_comercial, razon_social, nit, telefono, correo, pais_id, departamento_id, municipio_id });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando la empresa', error: error.message });
    }
});

// DELETE: Eliminar una empresa
router.delete('/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const query = 'DELETE FROM empresas WHERE id = ?';
      connection.query(query, [id], (err, results) => {
          if (err) {
              // Manejar el error de que la empresa está referenciada en otras tablas
              if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                  return res.status(400).json({
                      message: 'No se puede eliminar la empresa porque tiene datos relacionados en otras tablas.'
                  });
              }
              // Otros errores
              return res.status(500).json({ message: 'Error al eliminar la empresa', error: err.message });
          }
          if (results.affectedRows === 0) {
              return res.status(404).json({ message: 'Empresa no encontrada' });
          }
          res.json({ message: 'Empresa eliminada con éxito', id });
      });
  } catch (error) {
      res.status(500).json({ message: 'Error eliminando la empresa', error: error.message });
  }
});


module.exports = router;
