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
  tableData: any[] = [];
  departamentoId: number = 0;
  filters: any = {};

  @Input() showModal: boolean = false;
  @Input() editMode: boolean = false;
  @Input() paisId: number = 0;
  departamentoForm!: FormGroup;

  tableColumns = [
    { header: 'Nombre Departamento', key: 'nombre' },
    { header: 'Nombre País', key: 'pais_nombre' },
    {
      header: 'Municipios',
      key: 'municipios',
      type: 'button',
      action: 'goToMunicipios',
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

    this.departamentoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      pais_id: [{ value: this.paisId, disabled: true }, Validators.required],
    });
  }

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
        this.http.put(`http://localhost:3000/api/departamentos/${this.departamentoId}`, params).subscribe({
          next: (response) => {
            this.notifier.notify('success', 'Departamento actualizado correctamente.');
            this.resetForm();
            this.fetchDepartamentos(this.paisId);
          },
          error: (error) => {
            this.notifier.notify('error', 'Error al actualizar el departamento.');
            console.error('Error del servidor:', error);
          }
        });
      } else {
        const params = {
          nombre: departamentoData.nombre,
          pais_id: this.paisId
        };

        this.http.post('http://localhost:3000/api/departamentos', params).subscribe({
          next: (response) => {
            this.notifier.notify('success', 'Departamento agregado correctamente.');
            this.resetForm();
            this.fetchDepartamentos(this.paisId);
          },
          error: (error) => {
            this.notifier.notify('error', 'Error al agregar el departamento.');
          }
        });
      }
    } else {
      this.notifier.notify('error', 'Por favor, completa el formulario correctamente.');
    }
  }

  deleteDepartamento(departamentoId: any) {
    const url = `http://localhost:3000/api/departamentos/${departamentoId.id}`;
    this.http.delete<DepartamentoResponse>(url).subscribe({
      next: (response: DepartamentoResponse) => {
        // console.log('Departamento eliminado:', response);
        this.notifier.notify('success', 'Departamento eliminado correctamente.');
        this.fetchDepartamentos(this.paisId);  // Actualizar la tabla
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el departamento.';
        this.notifier.notify('error', errorMessage);
        // console.error('Error al eliminar el departamento:', error);
      }
    });
}


  onEdit(item: any) {
    console.log('Editar', item);
    this.departamentoId = item.id;
    this.departamentoForm.patchValue({
      nombre: item.nombre,
      pais_id: item.pais_id
    });
    this.editMode = true;
    this.showModal = true;
  }

  onDelete(itemId: number) {
    console.log('Eliminar ID:', itemId);
    if (confirm('¿Estás seguro de que deseas eliminar este departamento?')) {
      this.deleteDepartamento(itemId);
    }
  }

  onNew() {
    // console.log('Nuevo departamento');
    this.resetForm();
    this.showModal = true;
    this.editMode = false;
  }

  resetForm() {
    this.departamentoForm.reset();
    this.showModal = false;
  }
}
