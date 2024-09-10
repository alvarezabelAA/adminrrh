import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../shared/table/table.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from "../shared/modal/modal.component";
import { CommonModule } from '@angular/common';
import { NotifierService, NotifierModule } from 'angular-notifier';

interface DepartamentoResponse {
  id: number;
  nombre: string;
  pais_id: number;
}

@Component({
  selector: 'app-departamentos',
  standalone: true,
  imports: [TableComponent, ModalComponent, ReactiveFormsModule, CommonModule, NotifierModule],
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css']
})
export class DepartamentosComponent implements OnInit {
  // Datos para la tabla
  tableData: any[] = [];
  departamentoId: number = 0;
  filters: any = {};

  @Input() showModal: boolean = false;  // Mostrar/ocultar el modal
  @Input() editMode: boolean = false;  // Editar o crear nuevo
  @Input() paisId: number = 0;  // Recibir el ID del país desde otra pantalla
  departamentoForm!: FormGroup;

  // Definición de columnas
  tableColumns = [
    { header: 'Nombre Departamento', key: 'nombre' },
    { header: 'Nombre País', key: 'pais_nombre' },
    {
      header: 'Municipios',
      key: 'municipios',
      type: 'button', // Indicador de que esta columna contendrá un botón
      action: 'goToMunicipios', // El nombre de la acción que quieres realizar
      label: 'business',
      badgeNum: 1
    }
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private notifier: NotifierService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && localStorage) {
      this.paisId = +this.route.snapshot.paramMap.get('id')!;
      console.log('ID del país recibido:', this.paisId);
      if (this.paisId) {
        localStorage.setItem('paisId', String(this.paisId));
        console.log('ID del país guardado en localStorage:', this.paisId);
      } else {
        const storedPaisId = localStorage.getItem('paisId');
        if (storedPaisId) {
          this.paisId = +storedPaisId;
          console.log('ID del país recuperado desde localStorage:', this.paisId);
        } else {
          console.log('No se pasó ningún ID de país ni se encontró en localStorage');
        }
      }
    } else {
      console.log('localStorage no está disponible.');
    }

    if (this.paisId) {
      this.fetchDepartamentos(this.paisId);
    }

    // Inicializar el formulario con el pais_id deshabilitado
    this.departamentoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      pais_id: [{ value: this.paisId, disabled: true }, Validators.required],  // ID del país, deshabilitado
    });
  }

  // Obtener departamentos
  fetchDepartamentos(id_pais?: number) {
    let url = 'http://localhost:3000/api/departamentos';
    if (id_pais) {
      url += `?id_pais=${id_pais}`;
    }

    this.http.get<any[]>(url).subscribe({
      next: (response) => {
        console.log('Departamentos obtenidos:', response);
        this.tableData = response;
      },
      error: (error) => {
        console.error('Error al obtener los departamentos:', error);
      },
      complete: () => {
        console.log('Obtención de departamentos completada.');
      }
    });
  }

  // Manejar el envío del formulario
  onSubmit() {
    if (this.departamentoForm.valid) {
      const departamentoData = this.departamentoForm.value;
      console.log('Datos del formulario:', departamentoData);
      console.log(this.departamentoId)
      if (this.editMode) {
        const params = {
          nombre: departamentoData.nombre,
          pais_id: this.paisId
        }
        // Actualizar el departamento
        this.http.put(`http://localhost:3000/api/departamentos/${this.departamentoId}`, params).subscribe({
          next: (response) => {
            this.notifier.notify('success', 'Departamento actualizado correctamente.');
            this.resetForm();
            this.fetchDepartamentos(this.paisId);  // Actualizar la tabla de departamentos
          },
          error: (error) => {
            this.notifier.notify('error', 'Error al actualizar el departamento.');
            console.error('Error del servidor:', error);
          }
        });
      } else {
        // Insertar un nuevo departamento
        const params = {
          nombre: departamentoData.nombre,
          pais_id: this.paisId
        };

        this.http.post('http://localhost:3000/api/departamentos', params).subscribe({
          next: (response) => {
            this.notifier.notify('success', 'Departamento agregado correctamente.');
            this.resetForm();
            this.fetchDepartamentos(this.paisId);  // Actualizar la tabla de departamentos
          },
          error: (error) => {
            this.notifier.notify('error', 'Error al agregar el departamento.');
            console.error('Error del servidor:', error);
          }
        });
      }
    } else {
      this.notifier.notify('error', 'Por favor, completa el formulario correctamente.');
    }
  }

  // Eliminar un departamento (DELETE)
  deleteDepartamento(departamentoId: any) {
    const url = `http://localhost:3000/api/departamentos/${departamentoId.id}`;
    this.http.delete<DepartamentoResponse>(url).subscribe({
      next: (response: DepartamentoResponse) => {
        console.log('Departamento eliminado:', response);
        this.notifier.notify('success', 'Departamento eliminado correctamente.');
        this.fetchDepartamentos(this.paisId);  // Actualizar la tabla
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el departamento.';
        this.notifier.notify('error', errorMessage);
        console.error('Error al eliminar el departamento:', error);
      }
    });
}


  // Métodos para manejar las acciones
  onEdit(item: any) {
    console.log('Editar', item);
    this.departamentoId = item.id;  // Guardar el ID del departamento
    this.departamentoForm.patchValue({
      nombre: item.nombre,
      pais_id: item.pais_id
    });  // Rellenar el formulario con los datos del departamento
    this.editMode = true;  // Cambiar a modo de edición
    this.showModal = true;  // Mostrar el modal
  }

  onDelete(itemId: number) {
    console.log('Eliminar ID:', itemId);
    if (confirm('¿Estás seguro de que deseas eliminar este departamento?')) {
      this.deleteDepartamento(itemId);
    }
  }

  onNew() {
    console.log('Nuevo departamento');
    this.resetForm();
    this.showModal = true;
    this.editMode = false;  // Cambiar a modo de nuevo
  }

  // Reiniciar el formulario y ocultar el modal
  resetForm() {
    this.departamentoForm.reset();
    this.showModal = false;
  }
}
