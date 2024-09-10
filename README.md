# PdcApp

**PdcApp** es una aplicación de gestión de recursos humanos desarrollada con Angular. El objetivo principal es administrar la información de colaboradores y empresas, abarcando desde el mantenimiento de países, departamentos, y municipios, hasta la gestión de relaciones entre colaboradores y las empresas a las que pertenecen.

## Características del Proyecto

- **Frontend**: Angular con TailwindCSS para un diseño de interfaz moderno y responsivo.
- **Backend**: Node.js con una base de datos MySQL.
- **Funcionalidades CRUD**: Permite la creación, edición, eliminación y visualización de registros para países, departamentos, municipios, empresas y colaboradores.
- **Flujo de Navegación**: Los módulos de países, departamentos y municipios están enlazados de manera jerárquica. Además, los colaboradores cuentan con una relación directa con las empresas, mostrando la cantidad de empresas a las que pertenecen.

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/alvarezabelAA/adminrrh.git
   ```

2. Navega a la carpeta del proyecto e instala las dependencias:

   ```bash
   cd adminrrh
   npm install
   ```

3. Configura la base de datos:
   - Dentro de la carpeta `script`, encontrarás el script SQL para la creación de la base de datos.
   - Copia el script en MySQL Workbench y ejecuta las sentencias. Puedes omitir los `INSERT` si deseas comenzar con una base de datos limpia.

4. Configura el backend:
   - Navega a la carpeta `backend` e instala las dependencias:

     ```bash
     cd backend
     npm install
     ```

   - Modifica el archivo `database.js` con la configuración de conexión a tu base de datos.

5. Inicia el servidor backend:

   ```bash
   node server.js
   ```

6. Inicia el servidor de desarrollo en Angular:

   ```bash
   ng serve
   ```

   Accede a la aplicación en `http://localhost:4200/`.

## Pruebas

- Ejecuta las pruebas unitarias con:

   ```bash
   ng test
   ```

- Ejecuta las pruebas end-to-end con:

   ```bash
   ng e2e
   ```

## Documentación

La documentación completa del sistema, incluyendo la arquitectura, el diseño de la base de datos y los detalles de los mantenimientos CRUD, está disponible en el repositorio. Asegúrate de consultarla para obtener información más detallada sobre la implementación.

---
