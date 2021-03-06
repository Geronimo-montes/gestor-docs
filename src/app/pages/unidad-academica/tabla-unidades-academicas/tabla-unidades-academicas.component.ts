import { Router } from '@angular/router';
import { NbAccessChecker } from '@nebular/security';
import { NbDialogService } from '@nebular/theme';
import { ResponseData } from '../../../@core/data/headerOptions';
import {
  Observable,
  Subject,
} from 'rxjs';
import {
  take,
  takeUntil,
} from 'rxjs/operators';
import {
  EtypeMessage,
  ToastService
} from '../../../@core/mock/root-provider/Toast.service';
import {
  Iunidadacademica,
  UnidadAcademicaModel
} from '../../../@core/data/unidadAcademicaModel';
import {
  FILTER,
  SETTINGS
} from './unidad-academica-settings';
import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  ConfirmacionComponent,
  Eaccion,
  Iacciondata,
  typeicon
} from '../../../@theme/components';

@Component({
  selector: 'app-tabla-unidades-academicas',
  template: `<app-tabla [title]="title" [object]="object" [settings]="settings" 
    [loadingData]="loading | async" [data]="data | async" 
    (rowSelected)="unidadSeleccionada($event)" 
    [filter]="filter">
  </app-tabla>`,
  styleUrls: ['./tabla-unidades-academicas.component.scss']
})
export class TablaUnidadesAcademicasComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();

  public title: string = ''; // nombre de la tabla
  public object: string = 'unidad'; // nombre de la tabla
  public settings = SETTINGS;
  public filter = FILTER;
  public dataSource: Iunidadacademica[] = [];
  public loadingData: boolean = false;

  constructor(
    private unidadService: UnidadAcademicaModel,
    private toastService: ToastService,
    private dialogService: NbDialogService,
    private accessChecker: NbAccessChecker,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Indica el estado de carga de los datos, de tal manera que inavilita los controles
   */
  get loading(): Observable<boolean> {
    return new Observable((obs) => obs.next(this.loadingData));
  }

  /**
   * Observable de las unidades academicas a listar
   */
  get data(): Observable<Iunidadacademica[]> {
    return new Observable((obs) => obs.next(this.dataSource));
  }

  /**
   * Realiza la peticion para obtener la lista de unidades academicas registradas. 
   */
  private loadData() {
    this.loadingData = true;

    this.unidadService.getUnidadesAcademicas$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(unidadesAcademicas => {
        this.dataSource = unidadesAcademicas;
        this.loadingData = false;
      });
  }

  /**
   * Recibe el row selecccionado de la tabla junto a la accion a realizar
   * @param $event
   */
  public unidadSeleccionada($event: Iacciondata) {
    this.accessChecker.isGranted($event.accion, 'unidad')
      .pipe(takeUntil(this.destroy$))
      .subscribe(access => {
        if (access) {
          switch ($event.accion) {
            case Eaccion.UPDATE_DATA_LIST: this.loadData(); break;
            case Eaccion.EDIT: this.editar($event.data); break;
            case Eaccion.DELETE: this.delete($event.data); break;
            case Eaccion.VIEW: this.view($event.data); break;
          }
        } else {
          const
            title = 'Acceso denegado.',
            body = `No tienes permiso para realizar la accion solicitada.`;
          this.toastService.show(title, body, EtypeMessage.INFO);
        }
      });
  }

  /**
   * Una vez confirmados los cambios en la unidad seleccionado, realiza la peticion para la actualizaci??n de los datos
   * @param {Iunidadacademica} data 
   */
  private editar(data: Iunidadacademica) {
    this.unidadService.putUnidadAcademica$(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ResponseData) => {
        const
          title = 'Actualizaci??n de informaci??n',
          body = res.message,
          type = (res.response) ? EtypeMessage.SUCCESS : EtypeMessage.DANGER;

        this.toastService.show(title, body, type);
        this.loadData();
      });
  }

  /**
   * Da de baja del sistema al elemento seleccionado.
   * @param {Iunidadacademica} data 
   */
  private delete(data: Iunidadacademica) {
    this.unidadService.putEstatusUnidadAcademica(data.clave, data.estatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ResponseData) => {
        const
          title = (data.estatus === 'a') ?
            'Alta de Unidad Acad??mica' :
            'Baja de Unidad Acad??mica',
          body = res.message,
          type = (res.response) ? EtypeMessage.SUCCESS : EtypeMessage.DANGER;

        this.toastService.show(title, body, type);
        this.loadData();
      });
  }

  /**
   * Redirige la pagina a la lista de alumnos de la unidad acad??mica seleccionada.
   * @param data 
   */
  private view(data: Iunidadacademica) {
    const
      title = `Unidad Acad??mica ${data.nombre}`,
      body = `??Desea listar alumnos ?? empleados?`,
      type = typeicon.QUESTION;

    this.dialogService.open(ConfirmacionComponent, {
      context: { titulo: title, cuerpo: body, btnCancel: 'Alumnos', btnConfirmar: 'Empleados' },
      closeOnEsc: false,
      closeOnBackdropClick: false,
    }).onClose.pipe(takeUntil(this.destroy$))
      .subscribe((res: boolean) => {
        if (res)
          this.router.navigateByUrl(`/pages/empleado/tabla-empleados/${data.clave}`);
        else
          this.router.navigateByUrl(`/pages/alumno/tabla-alumnos/${data.clave}`);
      })
  }
}
