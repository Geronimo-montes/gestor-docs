import { fileType } from '../../../@theme/components/file-upload/fileType.validators';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  NbComponentShape,
  NbComponentStatus,
  NbTrigger,
  NbTriggerValues
} from '@nebular/theme';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { DocumentoModel } from '../../../@core/data/documentoModel';
import { take } from 'rxjs/operators';
import { ResponseData } from '../../../@core/data/headerOptions';
import { Router } from '@angular/router';
import { EtypeMessage, ToastService } from '../../../@core/mock/root-provider/Toast.service';

@Component({
  selector: 'app-form-registro-documentacion',
  templateUrl: './form-registro-documentacion.component.html',
  styleUrls: ['./form-registro-documentacion.component.scss']
})
export class FormRegistroDocumentacionComponent implements OnInit {

  public loadingData: boolean = false;

  public form: FormGroup;
  private count_documentos: number = 1;
  public nbPopoverError: string = ''; // Msj con el error del input
  public nbPopoverTrigger: NbTriggerValues = NbTrigger.FOCUS; // Forma de disparar el msj
  public nbComponentShape: NbComponentShape = 'semi-round'; // Para inputs
  public valid: NbComponentStatus = 'primary';
  public invalid: NbComponentStatus = 'danger';

  //data
  public formato = [
    { text: '*.PNG', value: 'png' },
    { text: '*.JPG', value: 'jpg' },
    { text: '*.PDF', value: 'pdf' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private documentoService: DocumentoModel,
    private toastService: ToastService,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      ruta_imagen: new FormControl('', [Validators.required, fileType]),
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]),
      descripcion: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(300)
      ]),
      numero_documentos: new FormControl(this.count_documentos,
        [Validators.required]),
      detalleDocumento: this.formBuilder.array([]),
    });

    this.addDocumento();
  }

  /**
   * @description Metodo get del array de controles para la catura de la ingormacion de un documento
   */
  get FormControlsdocumentos(): FormArray {
    return this.form.get('detalleDocumento') as FormArray;
  }

  /**
   * @description Agrega un grupo de controles al array de documentos
   */
  public addDocumento(): void {
    const detalleDocumento = this.formBuilder.group({
      foto_ejemplo: new FormControl('', [Validators.required, fileType]),
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]),
      formato: new FormControl('', [Validators.required]),
      peso_max: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]/),
        Validators.minLength(1),
        Validators.maxLength(10)
      ]),
      requerido: new FormControl(false, [Validators.required]),
    });

    this.FormControlsdocumentos.push(detalleDocumento);
    this.form.get('numero_documentos').setValue(this.count_documentos++);
  }

  /**
   * @description Elimina el elemento establecido, solo permite terer un control 
   * @param index Indice asignado al elemnto detro de formbuilder.array
   */
  public removeDocumento(index: number): void {
    this.FormControlsdocumentos.removeAt(index);
  }

  /**
 * @description Obtiene el mensaje de error con respecto a la validacion violada
 * @param controlName
 * @returns
 */
  public getError(controlName: string, form: FormGroup): string {
    // para lanzar el validador necesitamos levantar las bandreas dirty y touched
    form.get(controlName).markAsDirty();
    form.get(controlName).markAsTouched();
    const control = form.get(controlName);

    if (control.touched && control.errors != null)
      return (control.errors.required)
        ? `Campo obligatorio.` :
        (control.errors.pattern && controlName === 'email')
          ? `EL formato no corresponde a un correo válido.` :
          (control.errors.pattern && controlName === 'telefono')
            ? `Introdusca solo numeros, minimo 10 digitos y maximo 20 digitos` :
            (control.errors.pattern && controlName === 'matricula')
              ? `Introdusca unicamente 10 digitos. Ejemplo: 1234567890` :
              (control.errors.pattern && (controlName === 'nombre' || controlName === 'ape_1' || controlName === 'ape_2'))
                ? `Este campo solo acepta letras.` :
                (control.errors.minlength)
                  ? `La lonjitud mínima para el campo es ${control.errors.minlength.requiredLength}.` :
                  (control.errors.maxlength)
                    ? `La lonjitud máxima para el campo es ${control.errors.maxlength.requiredLength}.` :
                    (control.errors.fileType)
                      ? `Extension no valida. Solo imagenes en formato PNG` :
                      '';
    return '';
  }

  /**
   * @description Valida si la informacion del input y retorna un estatus.
   * @param controlName 
   * @param form 
   * @returns <NbComponentStatus>
   */
  public validatorInput(controlName: string, form: FormGroup): NbComponentStatus {
    return (!form.get(controlName).valid && form.get(controlName).dirty && form.get(controlName).touched) ?
      this.invalid :
      this.valid;
  }

  /**
   * @description Evento que se activa al enviar el formulario
   */
  public formSubmit() {
    // this.loadingData = true;
    this.documentoService.newPaqueteDocumentos$(this.form.value)
      .pipe(take(1))
      .subscribe((res: ResponseData) => {
        const
          title = 'Registro de paquete de documentos',
          body = res.message,
          type = (res.response) ? EtypeMessage.SUCCESS : EtypeMessage.DANGER;

        /** Metodo para subir la foto de perfil (sin terminar)**
         * const data = new FormData();
         * data.append('file', this.form.controls['perfil'].value);
         */


        this.toastService.show(title, body, type);
        // this.loadingData = false;
        // this.router.navigateByUrl('/pages/documentacion/tabla-documentacion');
      });
  }
}
