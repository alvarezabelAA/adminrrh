import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../shared/table/table.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { NotifierService, NotifierModule } from 'angular-notifier';

@Component({
  selector: 'app-colabora-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TableComponent, ModalComponent, NotifierModule],
  templateUrl: './colabora-empresa.component.html',
  styleUrls: ['./colabora-empresa.component.css']
})
export class ColaboraEmpresaComponent implements OnInit {
  empresaForm!: FormGroup;
  colaboradorId!: number;
  empresas: any[] = [];
  tableData: any[] = [];
  selectedEmpresa: any;
  showModal: boolean = false;
  editMode: boolean = false;

  tableColumns = [
    { header: 'Nombre Comercial', key: 'nombre_comercial' },
    { header: 'Razón Social', key: 'razon_social' },
    { header: 'Teléfono', key: 'telefono' },
    { header: 'Pais ', key: 'pais_nombre' },
    { header: 'Departamento', key: 'departamento_nombre' },
    { header: 'Municipio', key: 'municipio_nombre' },
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private notifier: NotifierService
  ) {}

  ngOnInit(): void {
    this.colaboradorId = +this.route.snapshot.paramMap.get('id')!;
    console.log('ID del colaborador:', this.colaboradorId);

    this.empresaForm = this.fb.group({
      empresa_id: ['', Validators.required]
    });

    this.fetchEmpresas();
    this.fetchColaborador(this.colaboradorId);
  }

  fetchEmpresas() {
    this.http.get<any[]>('http://localhost:3000/api/empresas').subscribe({
      next: (response) => {
        this.empresas = response;
      },
      error: (error) => {
        console.error('Error al obtener las empresas:', error);
        this.notifier.notify('error', 'Error al obtener las empresas.');
      }
    });
  }

  fetchColaborador(colaboradorId: number) {
    this.http.get<any>(`http://localhost:3000/api/empresasColab/${colaboradorId}`).subscribe({
      next: (response) => {
        if (response) {
          this.tableData = response;
        } else {
          this.tableData = [];
        }
      },
      error: (error) => {
        if (error.status === 404) {
          this.tableData = [];
        } else if (error.status === 500) {
          this.notifier.notify('error', 'Error del servidor. Por favor, intenta más tarde.');
        } else {
          this.notifier.notify('error', 'Error al obtener los datos del colaborador.');
        }
      }
    });
  }


  onNew() {
    this.resetForm();
    this.showModal = true;
    this.editMode = false;
  }

  onEdit(item: any) {
    this.selectedEmpresa = item.empresa_id;
    this.empresaForm.patchValue({
      empresa_id: item.empresa_id
    });
    this.showModal = true;
    this.editMode = true;
  }

  onDelete(item: any) {
    console.log('Eliminar empresa:', item);
    if (confirm('¿Estás seguro de que deseas eliminar esta empresa del colaborador?')) {
      const body = {
        colaborador_id: this.colaboradorId,
        empresa_id: item.empresa_id
      };
      // console.log('Eliminando empresa:', item);
      // console.log('Eliminando empresa:', body);
      this.http.request('DELETE', `http://localhost:3000/api/empresasColab/desasignar`, { body }).subscribe({
        next: (response) => {
          // console.log('Empresa eliminada:', response);
          this.notifier.notify('success', 'Empresa eliminada correctamente.');
          this.fetchColaborador(this.colaboradorId);
        },
        error: (error) => {
          this.notifier.notify('error', 'Error al eliminar la empresa.');
        }
      });
    }
  }


  onSubmit() {
    if (this.empresaForm.valid) {
      const data = {
        empresa_id: this.empresaForm.value.empresa_id,
        colaborador_id: this.colaboradorId
      };

      if (this.editMode) {
        this.http.put(`http://localhost:3000/api/empresasColab/actualizar/${this.colaboradorId}`, data).subscribe({
          next: (response) => {
            console.log('Relación actualizada:', response);
            this.notifier.notify('success', 'Relación actualizada correctamente.');
            this.showModal = false;
            this.fetchColaborador(this.colaboradorId);
          },
          error: (error) => {
            console.error('Error al actualizar la relación:', error);
            const errorMessage = error.error?.message || 'Error al actualizar la relación.';
            this.notifier.notify('error', errorMessage);
        }

        });
      } else {
        this.http.post(`http://localhost:3000/api/empresasColab/asignar`, data).subscribe({
          next: (response) => {
            console.log('Empresa asignada con éxito:', response);
            this.notifier.notify('success', 'Empresa asignada correctamente.');
            this.showModal = false;
            this.fetchColaborador(this.colaboradorId);
          },
          error: (error) => {
            const errorMessage = error.error?.message || 'Error al actualizar la relación.';
            this.notifier.notify('error', errorMessage);
        }
        });
      }
    }
  }

  resetForm() {
    this.showModal = false;
    this.empresaForm.reset();
  }
}
