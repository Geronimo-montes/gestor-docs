import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlumnoComponent } from './alumno.component';
import { FormRegistroAlumnoComponent } from './form-registro-alumno/form-registro-alumno.component';
import { TablaAlumnoComponent } from './tabla/tabla-alumno.component';

const routes: Routes = [
  {
    path: '',
    component: AlumnoComponent,
    children: [
      {
        path: 'tabla-alumnos/:claveunidad',
        component: TablaAlumnoComponent,
      }, {
        path: 'registro-alumno',
        component: FormRegistroAlumnoComponent,
      }, {
        path: 'registro-alumno/:claveunidad',
        component: FormRegistroAlumnoComponent,
      }, {
        path: '',
        redirectTo: 'tabla-alumnos',
        pathMatch: 'full',
      }, {
        path: '**',
        redirectTo: 'tabla-alumnos',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlumnoRoutingModule { }
