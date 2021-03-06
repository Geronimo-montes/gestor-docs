import { Component } from "@angular/core";

@Component({
  selector: 'app-one-column-layout',
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <app-header></app-header>
      </nb-layout-header>
      
      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column >
        <ng-content select="router-outlet"></ng-content>
        <div class="espacio"></div>
      </nb-layout-column>
  
      <nb-layout-footer fixed>
        <app-footer></app-footer> 
      </nb-layout-footer>
    </nb-layout>
  `,
  styleUrls: ['./one-column.layout.scss'],
})
export class OneColumnLayoutComponent { }