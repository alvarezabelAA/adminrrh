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
  tableData: any[] = [];
  empresaForm!: FormGroup;
  showModal: boolean = false;
  editMode: boolean = false;
  selectedEmpresaId: number | null = null;

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
    this.fetchPaises();
    this.fetchEmpresas();

    this.empresaForm = this.fb.group({
      nombre_comercial: ['', [Validators.required]],
      razon_social: ['', [Validators.required]],
      nit: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      pais_id: ['', []],
      departamento_id: ['', []],
      municipio_id: ['', []]
    });

    this.empresaForm.get('pais_id')?.valueChanges.subscribe(paisId => {
      if (paisId) {
        this.fetchDepartamentos(paisId);
      }
    });

    this.empresaForm.get('departamento_id')?.valueChanges.subscribe(departamentoId => {
      const paisId = this.empresaForm.get('pais_id')?.value;
      if (departamentoId && paisId) {
        this.fetchMunicipios(paisId, departamentoId);
      }
    });
  }



  fetchEmpresas() {
    this.http.get<any[]>('http://localhost:3000/api/empresas').subscribe({
      next: (response) => {
        this.tableData = response;
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
        this.paises = response;
      },
      error: (error) => {
        console.error('Error al obtener las empresas:', error);
      },
      complete: () => {
        console.log('Empresas obtenidas con éxito.');
      }
    });
  }

  departamentos: any[] = [];

  fetchDepartamentos(paisId: number) {
    this.http.get<any[]>(`http://localhost:3000/api/departamentos?id_pais=${paisId}`).subscribe({
      next: (response) => {
        this.departamentos = response;
        if (this.editMode) {
          const departamentoId = this.empresaForm.get('departamento_id')?.value;
          if (departamentoId) {
            this.fetchMunicipios(paisId, departamentoId);
          }
        }
      },
      error: (error) => {
        console.error('Error al obtener los departamentos:', error);
      }
    });
  }



municipios: any[] = [];

fetchMunicipios(paisId: number, departamentoId: number) {
  this.http.get<any[]>(`http://localhost:3000/api/municipios?id_pais=${paisId}&id_departamento=${departamentoId}`).subscribe({
    next: (response) => {
      this.municipios = response;
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
        this.http.put(`http://localhost:3000/api/empresas/${this.selectedEmpresaId}`, empresaData).subscribe({
          next: () => {
            this.notifier.notify('success', 'Empresa actualizada correctamente.');
            this.resetForm();
            this.fetchEmpresas();
          },
          error: (error) => {
            const errorMessage = error?.error?.message || 'Error desconocido al actualizar la empresa.';
            this.notifier.notify('error', `Error al actualizar la empresa: ${errorMessage}`);
          }

        });
      } else {
        this.http.post('http://localhost:3000/api/empresas', empresaData).subscribe({
          next: () => {
            this.notifier.notify('success', 'Empresa agregada correctamente.');
            this.resetForm();
            this.fetchEmpresas();
          },
          error: (error) => {
            const errorMessage = error?.error?.message || 'Error desconocido al agregar la empresa.';
            this.notifier.notify('error', `Error al agregar la empresa: ${errorMessage}`);
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

    this.empresaForm.get('pais_id')?.updateValueAndValidity();
    this.empresaForm.get('departamento_id')?.updateValueAndValidity();
    this.empresaForm.get('municipio_id')?.updateValueAndValidity();
  }


  onEdit(item: any) {
    this.selectedEmpresaId = item.id;
    this.editMode = true;

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

    this.fetchDepartamentos(item.pais_id);

    this.fetchMunicipios(item.pais_id, item.departamento_id);

    this.showModal = true;
  }


  onDelete(itemId: any) {
    this.http.delete(`http://localhost:3000/api/empresas/${itemId.id}`).subscribe({
      next: () => {
        this.notifier.notify('success', 'Empresa eliminada correctamente.');
        this.fetchEmpresas();
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Error desconocido al eliminar la empresa.';

        this.notifier.notify('error', `Error al eliminar la empresa: ${errorMessage}`);

      }
    });
  }


  onNew() {
    this.editMode = false;
    this.resetForm();
    this.updateValidators();
    this.showModal = true;
  }

  resetForm() {
    this.empresaForm.reset();
    this.showModal = false;
    this.editMode = false;
    this.selectedEmpresaId = null;
  }
}
