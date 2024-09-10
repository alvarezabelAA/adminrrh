CREATE DATABASE test_pdc;
USE test_pdc;

CREATE TABLE paises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pais_id INT,
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE CASCADE
);

CREATE TABLE municipios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento_id INT,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE
);

CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_comercial VARCHAR(150) NOT NULL,
    razon_social VARCHAR(150),
    nit VARCHAR(50),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    pais_id INT,
    departamento_id INT,
    municipio_id INT,
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE RESTRICT,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE RESTRICT,
    FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE RESTRICT
);

CREATE TABLE colaboradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    edad INT,
    telefono VARCHAR(20),
    correo VARCHAR(100)
);

CREATE TABLE colaboradores_empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colaborador_id INT,
    empresa_id INT,
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE RESTRICT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT
);

INSERT INTO paises (nombre) VALUES ('Guatemala');
INSERT INTO paises (nombre) VALUES ('El Salvador');

INSERT INTO departamentos (nombre, pais_id) VALUES ('Guatemala', 1);  -- Guatemala pertenece al país con id 1 (Guatemala)
INSERT INTO departamentos (nombre, pais_id) VALUES ('San Salvador', 2); -- San Salvador pertenece al país con id 2 (El Salvador)

INSERT INTO municipios (nombre, departamento_id) VALUES ('Zona 1', 1);  -- Zona 1 pertenece al departamento con id 1 (Guatemala)
INSERT INTO municipios (nombre, departamento_id) VALUES ('Mejicanos', 2); -- Mejicanos pertenece al departamento con id 2 (San Salvador)


INSERT INTO empresas (nombre_comercial, razon_social, nit, telefono, correo, pais_id, departamento_id, municipio_id)
VALUES ('Empresa A', 'Empresa A S.A.', '123456-7', '5555-5555', 'empresaA@example.com', 1, 1, 1);  -- Empresa A pertenece a Guatemala, Guatemala, Zona 1

INSERT INTO empresas (nombre_comercial, razon_social, nit, telefono, correo, pais_id, departamento_id, municipio_id)
VALUES ('Empresa B', 'Empresa B S.A.', '765432-1', '6666-6666', 'empresaB@example.com', 2, 2, 2);  -- Empresa B pertenece a El Salvador, San Salvador, Mejicanos


INSERT INTO colaboradores (nombre_completo, edad, telefono, correo) 
VALUES ('Juan Pérez', 30, '7777-7777', 'juan.perez@example.com');

INSERT INTO colaboradores (nombre_completo, edad, telefono, correo) 
VALUES ('Ana López', 25, '8888-8888', 'ana.lopez@example.com');


INSERT INTO colaboradores_empresas (colaborador_id, empresa_id) 
VALUES (1, 1);  -- Juan Pérez (colaborador 1) trabaja en Empresa A (empresa 1)

INSERT INTO colaboradores_empresas (colaborador_id, empresa_id) 
VALUES (2, 2);  -- Ana López (colaborador 2) trabaja en Empresa B (empresa 2)




