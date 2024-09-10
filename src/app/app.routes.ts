import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaisesComponent } from './paises/paises.component';
import { DepartamentosComponent } from './departamentos/departamentos.component';
import { MunicipiosComponent } from './municipios/municipios.component';
import { EmpresasComponent } from './empresas/empresas.component';
import { ColaboradoresComponent } from './colaboradores/colaboradores.component';
import { WelcomeComponent } from './welcome/welcome.component';  // Componente de bienvenida
import { ColaboraEmpresaComponent } from './colabora-empresa/colabora-empresa.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent, data: { breadcrumb: 'Inicio' } },  // Ruta para la raíz
  { path: 'paises', component: PaisesComponent, data: { breadcrumb: 'Países' } },  // Países es una ruta de primer nivel
  { path: 'departamentos', component: DepartamentosComponent, data: { breadcrumb: 'Departamentos', parent: 'paises' } },  // Departamentos depende de Países
  { path: 'departamentos/:id', component: DepartamentosComponent, data: { breadcrumb: 'Departamentos', parent: 'paises' } },
  { path: 'colabora-empresa/:id', component: ColaboraEmpresaComponent, data: { breadcrumb: 'Empresa', parent: 'colaboradores' } },
  { path: 'municipios', component: MunicipiosComponent, data: { breadcrumb: 'Municipios', parent: 'departamentos' } },  // Municipios depende de Departamentos
  { path: 'municipios/:id', component: MunicipiosComponent, data: { breadcrumb: 'Municipio', parent: 'municipios' } },
  { path: 'empresas', component: EmpresasComponent, data: { breadcrumb: 'Empresas' } },
  { path: 'colaboradores', component: ColaboradoresComponent, data: { breadcrumb: 'Colaboradores' } },
  { path: '**', redirectTo: '', pathMatch: 'full' }  // Ruta comodín
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
