import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],  
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() show: boolean = false;
  @Input() title: string = '';
  @Input() size: string = 'medium';

  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }

  // Clases dinámicas según el tamaño
  getSizeClasses(): string {
    const sizeClasses: any = {
      small: 'w-full sm:w-1/4',
      medium: 'w-full sm:w-1/2',
      large: 'w-full sm:w-3/4',
      'extra-large': 'w-full sm:max-w-6xl'
    };
    return sizeClasses[this.size] || sizeClasses['medium'];
  }


}
