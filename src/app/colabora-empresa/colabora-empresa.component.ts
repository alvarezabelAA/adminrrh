import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../shared/table/table.component'; // Importar tu componente de tabla
import { ModalComponent } from '../shared/modal/modal.component'; // Importar tu componente modal
import { NotifierService, NotifierModule } from 'angular-notifier'; // Importar el servicio y módulo de Notifier

@Component({
  selector: 'app-colabora-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TableComponent, ModalComponent, NotifierModule], // Importar módulos y componentes necesarios
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

  // Definición de las columnas de la tabla
  tableColumns = [
    { header: 'Nombre Comercial', key: 'nombre_comercial' },
    { header: 'Razón Social', key: 'razon_social' },
    { header: 'Teléfono', key: 'telefono' }
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private notifier: NotifierService // Inyectar el servicio de Notifier
  ) {}

  ngOnInit(): void {
    // Leer el ID que viene en la URL
    this.colaboradorId = +this.route.snapshot.paramMap.get('id')!;
    console.log('ID del colaborador:', this.colaboradorId);

    // Inicializar el formulario
    this.empresaForm = this.fb.group({
      empresa_id: ['', Validators.required]  // Campo para seleccionar la empresa
    });

    // Cargar las empresas y los datos del colaborador
    this.fetchEmpresas();
    this.fetchColaborador(this.colaboradorId);
  }

  // Función para obtener las empresas disponibles
  fetchEmpresas() {
    this.http.get<any[]>('http://localhost:3000/api/empresas').subscribe({
      next: (response) => {
        this.empresas = response;  // Asignar los datos de las empresas al array
      },
      error: (error) => {
        console.error('Error al obtener las empresas:', error);
        this.notifier.notify('error', 'Error al obtener las empresas.');  // Notificación de error
      }
    });
  }

  // Función para obtener la información del colaborador y mostrar la empresa relacionada
  fetchColaborador(colaboradorId: number) {
    console.log('Obteniendo datos del colaborador:', colaboradorId);
    this.http.get<any>(`http://localhost:3000/api/empresasColab/${colaboradorId}`).subscribe({
      next: (response) => {
        if (response) {
          console.log('Datos del colaborador:', response);
          this.tableData = response; // Asignar las empresas relacionadas a la tabla
        } else {
          console.log('No se encontraron empresas relacionadas para este colaborador.');
          this.tableData = []; // Vaciar la tabla si no hay empresas relacionadas
        }
      },
      error: (error) => {
        console.error('Error al obtener el colaborador:', error);
        // this.notifier.notify('error', 'Error al obtener los datos del colaborador.');  // Notificación de error
      }
    });
  }

  // Abrir modal para agregar una nueva empresa
  onNew() {
    this.resetForm();
    this.showModal = true;
    this.editMode = false;
  }

  // Editar una empresa existente
  onEdit(item: any) {
    this.selectedEmpresa = item.empresa_id;
    this.empresaForm.patchValue({
      empresa_id: item.empresa_id
    });
    this.showModal = true;
    this.editMode = true;
  }

  // Eliminar la relación entre colaborador y empresa
  onDelete(item: any) {
    console.log('Eliminar empresa:', item);
    if (confirm('¿Estás seguro de que deseas eliminar esta empresa del colaborador?')) {
      const body = {
        colaborador_id: this.colaboradorId,
        empresa_id: item.empresa_id
      };
      console.log('Eliminando empresa:', item);
      console.log('Eliminando empresa:', body);
      this.http.request('DELETE', `http://localhost:3000/api/empresasColab/desasignar`, { body }).subscribe({
        next: (response) => {
          console.log('Empresa eliminada:', response);
          this.notifier.notify('success', 'Empresa eliminada correctamente.'); // Notificación de éxito
          this.fetchColaborador(this.colaboradorId); // Actualizar tabla
        },
        error: (error) => {
          console.error('Error al eliminar la empresa:', error);
          this.notifier.notify('error', 'Error al eliminar la empresa.');  // Notificación de error
        }
      });
    }
  }


  // Enviar el formulario (Insertar o Actualizar la relación)
  onSubmit() {
    if (this.empresaForm.valid) {
      const data = {
        empresa_id: this.empresaForm.value.empresa_id,
        colaborador_id: this.colaboradorId
      };

      if (this.editMode) {
        // Actualizar relación
        this.http.put(`http://localhost:3000/api/empresasColab/actualizar/${this.colaboradorId}`, data).subscribe({
          next: (response) => {
            console.log('Relación actualizada:', response);
            this.notifier.notify('success', 'Relación actualizada correctamente.');  // Notificación de éxito
            this.showModal = false;
            this.fetchColaborador(this.colaboradorId); // Actualizar tabla
          },
          error: (error) => {
            console.error('Error al actualizar la relación:', error);
            const errorMessage = error.error?.message || 'Error al actualizar la relación.';
            this.notifier.notify('error', errorMessage);
        }

        });
      } else {
        // Insertar nueva relación
        this.http.post(`http://localhost:3000/api/empresasColab/asignar`, data).subscribe({
          next: (response) => {
            console.log('Empresa asignada con éxito:', response);
            this.notifier.notify('success', 'Empresa asignada correctamente.');  // Notificación de éxito
            this.showModal = false;
            this.fetchColaborador(this.colaboradorId); // Actualizar tabla
          },
          error: (error) => {
            console.error('Error al actualizar la relación:', error);
            const errorMessage = error.error?.message || 'Error al actualizar la relación.';
            this.notifier.notify('error', errorMessage);
        }
        });
      }
    }
  }

  // Resetear el formulario
  resetForm() {
    this.showModal = false;
    this.empresaForm.reset();
  }
}
