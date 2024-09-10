import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],  // Agrega RouterModule aquí
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() show: boolean = false;       // Para mostrar/ocultar el modal
  @Input() title: string = '';          // Título del modal
  @Input() size: string = 'medium';     // Tamaño del modal: small, medium, large, extra-large

  @Output() closeModal = new EventEmitter<void>(); // Evento para cerrar el modal

  // Función para cerrar el modal
  close() {
    this.closeModal.emit();
  }

  // Clases dinámicas según el tamaño
  getSizeClasses(): string {
    const sizeClasses: any = {
      small: 'w-full sm:w-1/4', // En pantallas pequeñas (móviles), ocupa todo el ancho
      medium: 'w-full sm:w-1/2', // En pantallas pequeñas, ocupa todo el ancho; en medianas, 50%
      large: 'w-full sm:w-3/4',  // En pantallas pequeñas, ocupa todo el ancho; en grandes, 75%
      'extra-large': 'w-full sm:max-w-6xl' // En pantallas pequeñas, ocupa todo el ancho; en grandes, tamaño extra
    };
    return sizeClasses[this.size] || sizeClasses['medium'];
  }


}
