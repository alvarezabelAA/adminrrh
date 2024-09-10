const express = require('express');
const router = express.Router();
const connection = require('../database');

// GET: Obtener todos los colaboradores
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.nombre_completo, c.edad, c.telefono, c.correo,
                   COUNT(ce.empresa_id) AS num_counter
            FROM colaboradores AS c
            LEFT JOIN colaboradores_empresas AS ce ON c.id = ce.colaborador_id
            GROUP BY c.id;
        `;
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error en la consulta GET colaboradores:', err.message);
                return res.status(500).json({ message: 'Error en la consulta de colaboradores', error: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        res.status(500).json({ message: 'Error inesperado en la consulta', error: error.message });
    }
});


// POST: Agregar un colaborador
router.post('/', async (req, res) => {
    try {
        const { nombre_completo, edad, telefono, correo } = req.body;

        if (!nombre_completo || !edad || !telefono || !correo) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        const colaboradorQuery = 'INSERT INTO colaboradores (nombre_completo, edad, telefono, correo) VALUES (?, ?, ?, ?)';
        connection.query(colaboradorQuery, [nombre_completo, edad, telefono, correo], (err, results) => {
            if (err) {
                console.error('Error al insertar colaborador:', err.message);
                return res.status(500).json({ message: 'Error al insertar colaborador', error: err.message });
            }
            res.json({ id: results.insertId, nombre_completo, edad, telefono, correo });
        });
    } catch (error) {
        console.error('Error inesperado al agregar colaborador:', error.message);
        res.status(500).json({ message: 'Error inesperado al agregar colaborador', error: error.message });
    }
});

// PUT: Actualizar un colaborador
router.put('/:id', async (req, res) => {
    try {
        const { nombre_completo, edad, telefono, correo } = req.body;
        const { id } = req.params;

        if (!nombre_completo || !edad || !telefono || !correo) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        const colaboradorQuery = 'UPDATE colaboradores SET nombre_completo = ?, edad = ?, telefono = ?, correo = ? WHERE id = ?';
        connection.query(colaboradorQuery, [nombre_completo, edad, telefono, correo, id], (err, results) => {
            if (err) {
                console.error('Error al actualizar colaborador:', err.message);
                return res.status(500).json({ message: 'Error al actualizar colaborador', error: err.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Colaborador no encontrado' });
            }
            res.json({ message: 'Colaborador actualizado con éxito', id, nombre_completo, edad, telefono, correo });
        });
    } catch (error) {
        console.error('Error inesperado al actualizar colaborador:', error.message);
        res.status(500).json({ message: 'Error inesperado al actualizar colaborador', error: error.message });
    }
});

// DELETE: Eliminar un colaborador y su relación con una empresa
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Primero eliminamos la relación en la tabla intermedia
        const relacionQuery = 'DELETE FROM colaboradores_empresas WHERE colaborador_id = ?';
        connection.query(relacionQuery, [id], (err, results) => {
            if (err) {
                console.error('Error al eliminar relación colaborador-empresa:', err.message);
                return res.status(500).json({ message: 'Error al eliminar relación colaborador-empresa', error: err.message });
            }

            // Luego eliminamos al colaborador
            const colaboradorQuery = 'DELETE FROM colaboradores WHERE id = ?';
            connection.query(colaboradorQuery, [id], (err, results) => {
                if (err) {
                    console.error('Error al eliminar colaborador:', err.message);
                    return res.status(500).json({ message: 'Error al eliminar colaborador', error: err.message });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Colaborador no encontrado' });
                }
                res.json({ message: 'Colaborador eliminado con éxito', id });
            });
        });
    } catch (error) {
        console.error('Error inesperado al eliminar colaborador:', error.message);
        res.status(500).json({ message: 'Error inesperado al eliminar colaborador', error: error.message });
    }
});

module.exports = router;
