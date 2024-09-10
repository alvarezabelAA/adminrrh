import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../shared/table/table.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../shared/modal/modal.component';
import { NotifierModule } from 'angular-notifier';

@Component({
  selector: 'app-municipios',
  standalone: true,
  imports: [
    TableComponent,
    ModalComponent,
    ReactiveFormsModule,
    CommonModule,
    NotifierModule
  ],
  templateUrl: './municipios.component.html',
  styleUrls: ['./municipios.component.css']
})
export class MunicipiosComponent implements OnInit {
  // Datos para la tabla
  tableData: any[] = [];
  municipio: any | null = null;
  municipioForm!: FormGroup;
  showModal: boolean = false;
  editMode: boolean = false;
  selectedMunicipioId: number | null = null;
  departamentoSave : any;
  paisSave : any;
  // Definición de columnas
  tableColumns = [
    { header: 'Municipio', key: 'nombre' },
    { header: 'Departamento', key: 'departamento_nombre' },
    { header: 'País', key: 'pais_nombre' }
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private notifier: NotifierService  // Notifier para mostrar mensajes de éxito o error
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.municipio = params['ids'] ? JSON.parse(params['ids']) : null;

      console.log('Objeto municipio recibido:', this.municipio);

      // Verificar si el objeto municipio tiene los valores necesarios
      if (this.municipio) {
        const departamentoId = this.municipio.id;
        const paisId = this.municipio.pais_id;

        // Guardar los valores en localStorage
        localStorage.setItem('departamentoSave', String(departamentoId));
        localStorage.setItem('paisSave', String(paisId));

        this.departamentoSave = departamentoId;
        this.paisSave = paisId;

        console.log('Departamento ID:', departamentoId);
        console.log('País ID:', paisId);

        // Llamar a fetchMunicipios con los IDs recibidos
        this.fetchMunicipios(departamentoId, paisId);
      } else {
        // Recuperar valores de localStorage si no se reciben en los parámetros
        const storedDepartamentoId = localStorage.getItem('departamentoSave');
        const storedPaisId = localStorage.getItem('paisSave');

        if (storedDepartamentoId && storedPaisId) {
          this.departamentoSave = +storedDepartamentoId;
          this.paisSave = +storedPaisId;

          console.log('Departamento recuperado de localStorage:', this.departamentoSave);
          console.log('País recuperado de localStorage:', this.paisSave);

          // Llamar a fetchMunicipios con los valores recuperados
          this.fetchMunicipios(this.departamentoSave, this.paisSave);
        } else {
          console.log('No se encontraron valores en localStorage');
        }
      }
    });

    // Inicializamos el formulario para municipios con validaciones
    this.municipioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }


  // Función para obtener los municipios desde el backend con filtrado
  fetchMunicipios(departamentoId?: number, paisId?: number) {
    let url = 'http://localhost:3000/api/municipios';

    if (departamentoId || paisId) {
      url += '?';
      if (departamentoId) {
        url += `id_departamento=${departamentoId}`;
      }
      if (paisId) {
        url += departamentoId ? `&id_pais=${paisId}` : `id_pais=${paisId}`;
      }
    }

    this.http.get<any[]>(url).subscribe({
      next: (response) => {
        console.log(response);
        this.tableData = response;
      },
      error: (error) => {
        console.error('Error al obtener los municipios:', error);
      },
      complete: () => {
        console.log('Obtención de municipios completada.');
      }
    });
  }

  // Manejar el envío del formulario
  onSubmit() {
    if (this.municipioForm.valid) {
      const municipioData = this.municipioForm.value;
      console.log('Datos del formulario:', municipioData);
      console.log(this.selectedMunicipioId);
      const params2 = {
        nombre: municipioData.nombre,
        departamento_id: this.departamentoSave
      }
      if (this.editMode) {
        // Actualizar el municipio
        this.http.put(`http://localhost:3000/api/municipios/${this.selectedMunicipioId}`, params2).subscribe({
          next: (response) => {
            this.notifier.notify('success', 'Municipio actualizado correctamente.');
            this.resetForm();
            this.fetchMunicipios(this.departamentoSave, this.paisSave);
          },
          error: (error) => {
            this.notifier.notify('error', 'Error al actualizar el municipio.');
            console.error('Error del servidor:', error);
          }
        });
      } else {
        // Insertar un nuevo municipio
        console.log('Insertar un nuevo municipio', municipioData);
        const params = {
          nombre: municipioData.nombre,
          departamento_id: this.departamentoSave
        }
        console.log(this.departamentoSave)
        this.http.post('http://localhost:3000/api/municipios', params).subscribe({
          next: (response) => {
            this.notifier.notify('success', 'Municipio agregado correctamente.');
            this.resetForm();
            this.fetchMunicipios(this.departamentoSave, this.paisSave);
          },
          error: (error) => {
            this.notifier.notify('error', 'Error al agregar el municipio.');
            console.error('Error del servidor:', error);
          }
        });
      }
    } else {
      this.notifier.notify('error', 'Por favor, completa el formulario correctamente.');
    }
  }

  // Método para manejar la edición de un municipio
  onEdit(item: any) {
    console.log('Editar', item);
    this.selectedMunicipioId = item.id;
    this.municipioForm.patchValue({
      nombre: item.nombre,
      departamento_id: item.departamento_id
    });
    this.editMode = true;
    this.showModal = true;
  }

  // Método para manejar la eliminación de un municipio
  onDelete(itemId: any) {
    if (confirm('¿Estás seguro de que deseas eliminar este municipio?')) {
      const url = `http://localhost:3000/api/municipios/${itemId.id}`;
      this.http.delete(url).subscribe({
        next: (response) => {
          this.notifier.notify('success', 'Municipio eliminado correctamente.');
          this.fetchMunicipios(this.departamentoSave, this.paisSave);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Error al eliminar el municipio.';
          this.notifier.notify('error', errorMessage);
          console.error('Error al eliminar el municipio:', error);
        }
      });
    }
  }

  // Método para agregar un nuevo municipio (iniciar el formulario en modo "nuevo")
  onNew() {
    console.log('Agregar nuevo registro');
    this.resetForm();
    this.showModal = true;
    this.editMode = false;
  }

  // Reiniciar el formulario
  resetForm() {
    this.municipioForm.reset();
    this.showModal = false;
    this.editMode = false;
    this.selectedMunicipioId = null;
  }
}
