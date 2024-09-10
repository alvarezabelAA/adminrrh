import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../shared/table/table.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotifierService, NotifierModule } from 'angular-notifier';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paises',
  standalone: true,
  imports: [CommonModule,
    TableComponent,
    ModalComponent,
    ReactiveFormsModule,
    NotifierModule],
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.css']
})
export class PaisesComponent implements OnInit {
  tableData: any[] = [];
  showModal: boolean = false;
  editMode: boolean = false;  // Para verificar si estamos en modo edición
  selectedPaisId: number | null = null;  // Para almacenar el ID del país seleccionado

  constructor(private http: HttpClient, private fb: FormBuilder, private notifier: NotifierService, private router: Router) {}

  // Formulario
  paisForm!: FormGroup;

  ngOnInit() {
    // llamada paises
    this.fetchPaises();
    // Formulario
    this.paisForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  tableColumns = [
    { header: 'Nombre', key: 'nombre' },
    {
      header: 'Departamentos',
      key: 'departamentos',
      type: 'button', // Indicador de que esta columna contendrá un botón
      action: 'goToDepartamentos', // El nombre de la acción que quieres realizar
      label: 'business',
      badgeNum: 2
    }
  ];


  goToDepartamentos(paisId: number) {
    // Aquí podrías agregar la lógica de redirección y pasar el "paisId" si es necesario
    this.router.navigate(['/departamentos', paisId]); // Redirigir a la página de departamentos
  }



  // Método para manejar el envío del formulario
  onSubmit() {
    if (this.paisForm.valid) {
      const paisData = this.paisForm.value;

      if (this.editMode) {
        // Actualizar el país
        this.http.put(`http://localhost:3000/api/paises/${this.selectedPaisId}`, paisData).subscribe({
          next: (response) => {
            this.notifier.notify('success', 'País actualizado correctamente.');
            this.resetForm();
            this.fetchPaises();
          },
          error: (error) => {
            this.notifier.notify('error', 'Error al actualizar el país.');
            console.error('Error del servidor:', error);
          }
        });
      } else {
        // Insertar un nuevo país
        this.http.post('http://localhost:3000/api/paises', paisData).subscribe({
          next: (response) => {
            this.notifier.notify('success', 'País agregado correctamente.');
            this.resetForm();
            this.fetchPaises();
          },
          error: (error) => {
            this.notifier.notify('error', 'Error al agregar el país.');
            console.error('Error del servidor:', error);
          }
        });
      }
    } else {
      this.notifier.notify('error', 'Por favor, completa el formulario correctamente.');
    }
  }

  // Método para resetear el formulario
  resetForm() {
    this.paisForm.reset();
    this.editMode = false;  // Salir del modo edición
    this.selectedPaisId = null;
    this.showModal = false;
  }

  // Obtener los países
  fetchPaises() {
    this.http.get<any[]>('http://localhost:3000/api/paises').subscribe({
      next: (response) => {
        console.log('Países:', response);
        this.tableData = response;
      },
      error: (error) => {
        console.error('Error al obtener los países:', error);
      }
    });
  }

  // Metodos CRUD
  onEdit(pais: any) {
    this.selectedPaisId = pais.id;
    this.paisForm.patchValue({
      nombre: pais.nombre
    });
    this.editMode = true;  // Activar el modo edición
    this.showModal = true;  // Mostrar el modal para edición
  }

  onDelete(item: any) {
    this.http.delete(`http://localhost:3000/api/paises/${item.id}`).subscribe({
      next: (response) => {
        this.notifier.notify('success', 'País eliminado correctamente.');
        this.fetchPaises();  // Recargar los países
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el país.';
        this.notifier.notify('error', errorMessage);
        console.error('Error del servidor:', error);
      }
    });
}


  onNew() {
    this.resetForm();  // Limpiar el formulario para una nueva entrada
    this.showModal = true;  // Mostrar el modal para agregar
  }

  // Función para modal
  openModal() {
    this.showModal = true;
  }
}

