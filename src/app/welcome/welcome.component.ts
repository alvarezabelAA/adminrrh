import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

  constructor(private router: Router) {}

  // Función para navegar al dashboard o cualquier sección que quieras
  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
