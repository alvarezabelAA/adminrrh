import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';  // Asegúrate de importar RouterModule
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from "./shared/breadcrumb/breadcrumb.component";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, BreadcrumbComponent],  // Agrega RouterModule aquí
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pdc_app';

  // Propiedad que indica si el menú móvil está visible o no
  isMenuOpen = false;

  // Método para alternar la visibilidad del menú
  toggleMenu() {
    console.log('toggleMenu');
    this.isMenuOpen = !this.isMenuOpen;
  }
}
