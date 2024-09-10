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
  editMode: boolean = false;
  selectedPaisId: number | null = null;

  constructor(private http: HttpClient, private fb: FormBuilder, private notifier: NotifierService, private router: Router) {}

  paisForm!: FormGroup;

  ngOnInit() {
    this.fetchPaises();
    this.paisForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  tableColumns = [
    { header: 'Nombre', key: 'nombre' },
    {
      header: 'Departamentos',
      key: 'departamentos',
      type: 'button',
      action: 'goToDepartamentos',
      label: 'business',
      badgeNum: 2
    }
  ];


  goToDepartamentos(paisId: number) {
    this.router.navigate(['/departamentos', paisId]);
  }



  onSubmit() {
    if (this.paisForm.valid) {
      const paisData = this.paisForm.value;

      if (this.editMode) {
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

  resetForm() {
    this.paisForm.reset();
    this.editMode = false;
    this.selectedPaisId = null;
    this.showModal = false;
  }

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
    this.editMode = true;
    this.showModal = true;
  }

  onDelete(item: any) {
    this.http.delete(`http://localhost:3000/api/paises/${item.id}`).subscribe({
      next: (response) => {
        this.notifier.notify('success', 'País eliminado correctamente.');
        this.fetchPaises();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el país.';
        this.notifier.notify('error', errorMessage);
        console.error('Error del servidor:', error);
      }
    });
}


  onNew() {
    this.resetForm();
    this.showModal = true;
  }

  openModal() {
    this.showModal = true;
  }
}

