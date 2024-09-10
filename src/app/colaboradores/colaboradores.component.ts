import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../shared/table/table.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotifierModule, NotifierService } from 'angular-notifier';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../shared/modal/modal.component";

@Component({
  selector: 'app-colaboradores',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule, NotifierModule, CommonModule, ModalComponent],
  templateUrl: './colaboradores.component.html',
  styleUrls: ['./colaboradores.component.css']
})
export class ColaboradoresComponent implements OnInit {
  tableData: any[] = [];
  colaboradorForm!: FormGroup;
  editMode: boolean = false;
  selectedColaboradorId: number | null = null;
  showModal: boolean = false;

  tableColumns = [
    { header: 'Nombre Completo', key: 'nombre_completo' },
    { header: 'Edad', key: 'edad' },
    { header: 'Teléfono', key: 'telefono' },
    { header: 'Correo', key: 'correo' },
    {
      header: 'Empresas',
      key: 'empresas',
      type: 'button',
      action: 'gotToColaboradores',
      label: 'business',
      badgeNum: 2
    }
  ];

  constructor(private http: HttpClient, private fb: FormBuilder, private notifier: NotifierService) {}

  ngOnInit() {
    this.fetchColaboradores();

    this.colaboradorForm = this.fb.group({
      nombre_completo: ['', [Validators.required]],
      edad: ['', [Validators.required, Validators.min(18)]],
      telefono: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  fetchColaboradores() {
    this.http.get<any[]>('http://localhost:3000/api/colaboradores').subscribe({
      next: (response) => {
        console.log('Colaboradores:', response);
        this.tableData = response;
      },
      error: (error) => {
        this.notifier.notify('error', 'Error al obtener los colaboradores');
        console.error('Error al obtener los colaboradores:', error);
      }
    });
  }

  onSubmit() {
    if (this.colaboradorForm.invalid) {
      return;
    }

    const colaboradorData = this.colaboradorForm.value;

    if (this.editMode && this.selectedColaboradorId) {
      this.http.put(`http://localhost:3000/api/colaboradores/${this.selectedColaboradorId}`, colaboradorData).subscribe({
        next: () => {
          this.notifier.notify('success', 'Colaborador actualizado con éxito');
          this.fetchColaboradores();
          this.resetForm();
        },
        error: (error) => {
          this.notifier.notify('error', 'Error al actualizar el colaborador');
          console.error('Error al actualizar el colaborador:', error);
        }
      });
    } else {
      this.http.post('http://localhost:3000/api/colaboradores', colaboradorData).subscribe({
        next: () => {
          this.notifier.notify('success', 'Colaborador agregado con éxito');
          this.fetchColaboradores();
          this.resetForm();
        },
        error: (error) => {
          this.notifier.notify('error', 'Error al agregar el colaborador');
          console.error('Error al agregar el colaborador:', error);
        }
      });
    }
  }

  onEdit(item: any) {
    this.editMode = true;
    this.selectedColaboradorId = item.id;
    this.colaboradorForm.patchValue(item);
    this.showModal = true;
  }

  onDelete(itemId: any) {
    if (confirm('¿Estás seguro de que deseas eliminar este colaborador?')) {
      this.http.delete(`http://localhost:3000/api/colaboradores/${itemId.id}`).subscribe({
        next: () => {
          this.notifier.notify('success', 'Colaborador eliminado con éxito');
          this.fetchColaboradores();
        },
        error: (error) => {
          if (error.status === 400 && error.error.message.includes('relaciones activas')) {
            this.notifier.notify('error', 'No se puede eliminar el colaborador porque tiene relaciones activas con empresas');
          } else if (error.status === 404) {
            this.notifier.notify('error', 'Colaborador no encontrado');
          } else {
            this.notifier.notify('error', 'Error al eliminar el colaborador');
          }
        }
      });
    }
  }


  onNew() {
    this.resetForm();
    this.showModal = true;
  }

  resetForm() {
    this.colaboradorForm.reset();
    this.editMode = false;
    this.selectedColaboradorId = null;
    this.showModal = false;
  }
}
