import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotifierService, NotifierModule } from 'angular-notifier';
import { TableComponent } from '../shared/table/table.component';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../shared/modal/modal.component";

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule, NotifierModule, CommonModule, ModalComponent],
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {
  tableData: any[] = [];  // Datos para la tabla
  empresaForm!: FormGroup;  // Formulario reactivo
  showModal: boolean = false;  // Para controlar la visibilidad del modal
  editMode: boolean = false;  // Para identificar si estamos en modo edición
  selectedEmpresaId: number | null = null;  // Almacenar el ID de la empresa seleccionada

  // Definición de columnas
  tableColumns = [
    { header: 'Nombre Comercial', key: 'nombre_comercial' },
    { header: 'Razón Social', key: 'razon_social' },
    { header: 'NIT', key: 'nit' },
    { header: 'Teléfono', key: 'telefono' },
    { header: 'Correo', key: 'correo' },
    { header: 'País', key: 'pais' },
    { header: 'Departamento', key: 'departamento' },
    { header: 'Municipio', key: 'municipio' }
  ];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private notifier: NotifierService
  ) {}

  ngOnInit() {
    this.fetchPaises();  // Obtener la lista de países
    this.fetchEmpresas();  // Obtener la lista de empresas

    // Inicializar el formulario
    this.empresaForm = this.fb.group({
      nombre_comercial: ['', [Validators.required]],
      razon_social: ['', [Validators.required]],
      nit: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      pais_id: ['', []],  // País (select)
      departamento_id: ['', []],  // Departamento (select)
      municipio_id: ['', []]  // Municipio (select)
    });

    // Escuchar cambios en pais_id para cargar los departamentos
    this.empresaForm.get('pais_id')?.valueChanges.subscribe(paisId => {
      if (paisId) {
        this.fetchDepartamentos(paisId);  // Cargar los departamentos basados en el país seleccionado
      }
    });

    // Escuchar cambios en departamento_id para cargar los municipios
    this.empresaForm.get('departamento_id')?.valueChanges.subscribe(departamentoId => {
      const paisId = this.empresaForm.get('pais_id')?.value;
      if (departamentoId && paisId) {
        this.fetchMunicipios(paisId, departamentoId);  // Cargar los municipios basados en el departamento seleccionado
      }
    });
  }



  // Obtener empresas del backend
  fetchEmpresas() {
    this.http.get<any[]>('http://localhost:3000/api/empresas').subscribe({
      next: (response) => {
        this.tableData = response;  // Asignar los datos a la tabla
      },
      error: (error) => {
        console.error('Error al obtener las empresas:', error);
      },
      complete: () => {
        console.log('Empresas obtenidas con éxito.');
      }
    });
  }

  paises: any[] = [];

  fetchPaises() {
    this.http.get<any[]>('http://localhost:3000/api/paises').subscribe({
      next: (response) => {
        this.paises = response;  // Asignar los datos a la tabla
      },
      error: (error) => {
        console.error('Error al obtener las empresas:', error);
      },
      complete: () => {
        console.log('Empresas obtenidas con éxito.');
      }
    });
  }

  departamentos: any[] = [];  // Almacenar los departamentos

  fetchDepartamentos(paisId: number) {
    this.http.get<any[]>(`http://localhost:3000/api/departamentos?id_pais=${paisId}`).subscribe({
      next: (response) => {
        this.departamentos = response;  // Asignar los departamentos obtenidos
        if (this.editMode) {
          const departamentoId = this.empresaForm.get('departamento_id')?.value;
          if (departamentoId) {
            this.fetchMunicipios(paisId, departamentoId);  // Cargar los municipios del departamento seleccionado
          }
        }
      },
      error: (error) => {
        console.error('Error al obtener los departamentos:', error);
      }
    });
  }



municipios: any[] = [];  // Almacenar los municipios

fetchMunicipios(paisId: number, departamentoId: number) {
  this.http.get<any[]>(`http://localhost:3000/api/municipios?id_pais=${paisId}&id_departamento=${departamentoId}`).subscribe({
    next: (response) => {
      this.municipios = response;  // Asignar los municipios obtenidos
    },
    error: (error) => {
      console.error('Error al obtener los municipios:', error);
    }
  });
}



  // Insertar una nueva empresa
  onSubmit() {
    if (this.empresaForm.valid) {
      const empresaData = this.empresaForm.value;
      console.log('Datos de la empresa:', empresaData);
      console.log('Modo edición:', this.selectedEmpresaId);
      if (this.editMode) {
        // Actualizar una empresa existente
        this.http.put(`http://localhost:3000/api/empresas/${this.selectedEmpresaId}`, empresaData).subscribe({
          next: () => {
            this.notifier.notify('success', 'Empresa actualizada correctamente.');
            this.resetForm();
            this.fetchEmpresas();
          },
          error: (error) => {
            const errorMessage = error?.error?.message || 'Error desconocido al actualizar la empresa.';
            this.notifier.notify('error', `Error al actualizar la empresa: ${errorMessage}`);
            console.error('Error al actualizar la empresa:', error);
          }

        });
      } else {
        // Crear una nueva empresa
        this.http.post('http://localhost:3000/api/empresas', empresaData).subscribe({
          next: () => {
            this.notifier.notify('success', 'Empresa agregada correctamente.');
            this.resetForm();
            this.fetchEmpresas();
          },
          error: (error) => {
            const errorMessage = error?.error?.message || 'Error desconocido al agregar la empresa.';
            this.notifier.notify('error', `Error al agregar la empresa: ${errorMessage}`);
            console.error('Error al agregar la empresa:', error);
          }

        });
      }
    } else {
      this.notifier.notify('error', 'Por favor, complete el formulario correctamente.');
    }
  }

  updateValidators() {
    const isRequired = this.editMode ? [] : [Validators.required];

    this.empresaForm.get('pais_id')?.setValidators(isRequired);
    this.empresaForm.get('departamento_id')?.setValidators(isRequired);
    this.empresaForm.get('municipio_id')?.setValidators(isRequired);

    // Actualizar el estado de las validaciones
    this.empresaForm.get('pais_id')?.updateValueAndValidity();
    this.empresaForm.get('departamento_id')?.updateValueAndValidity();
    this.empresaForm.get('municipio_id')?.updateValueAndValidity();
  }


  // Manejar la edición de una empresa
  onEdit(item: any) {
    this.selectedEmpresaId = item.id;
    this.editMode = true;  // Cambiar a modo de edición

    // Poner los valores en el formulario, incluyendo los select
    this.empresaForm.patchValue({
      nombre_comercial: item.nombre_comercial,
      razon_social: item.razon_social,
      nit: item.nit,
      telefono: item.telefono,
      correo: item.correo,
      pais_id: item.pais_id,
      departamento_id: item.departamento_id,
      municipio_id: item.municipio_id
    });

    // Cargar los departamentos del país seleccionado
    this.fetchDepartamentos(item.pais_id);

    // Cargar los municipios del departamento seleccionado
    this.fetchMunicipios(item.pais_id, item.departamento_id);

    this.showModal = true;  // Mostrar el modal de edición
  }


  // Manejar la eliminación de una empresa
  onDelete(itemId: any) {
    this.http.delete(`http://localhost:3000/api/empresas/${itemId.id}`).subscribe({
      next: () => {
        this.notifier.notify('success', 'Empresa eliminada correctamente.');
        this.fetchEmpresas();  // Recargar la lista de empresas
      },
      error: (error) => {
        // Obtener el mensaje de error desde el backend, si existe
        const errorMessage = error?.error?.message || 'Error desconocido al eliminar la empresa.';

        // Mostrar el error en la notificación
        this.notifier.notify('error', `Error al eliminar la empresa: ${errorMessage}`);

        console.error('Error al eliminar la empresa:', error);
      }
    });
  }


  // Abrir el formulario para agregar una nueva empresa
  onNew() {
    this.editMode = false;  // Cambiar a modo de nuevo
    this.resetForm();  // Reiniciar el formulario
    this.updateValidators();  // Actualizar las validaciones para el modo de creación
    this.showModal = true;  // Mostrar el modal
  }

  // Reiniciar el formulario
  resetForm() {
    this.empresaForm.reset();
    this.showModal = false;
    this.editMode = false;
    this.selectedEmpresaId = null;
  }
}
