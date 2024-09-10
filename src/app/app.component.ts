import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from "./shared/breadcrumb/breadcrumb.component";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, BreadcrumbComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pdc_app';

  isMenuOpen = false;

  toggleMenu() {
    console.log('toggleMenu');
    this.isMenuOpen = !this.isMenuOpen;
  }
}
