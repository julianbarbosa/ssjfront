import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { VisitaLimpiaService } from '../../../core/services/visita-limpia.service';
import { VisitaService } from '../../../core/services/visita.service';
import { Gestion } from './gestion';

const visitaApi = {
  enviados: [] as { codigo: string; valor: string | number | null }[],
  imagenes: 0,
  obtenerFormulario: () => of([]),
  guardarCampo: (
    _idVisita: number,
    campo: { codigo: string; valor: string | number | null },
    valor: string | number | null = campo.valor,
  ) => {
    visitaApi.enviados.push({ codigo: campo.codigo, valor });
    return of({ success: true, value: 'guardado-servidor' });
  },
  guardarImagen: () => {
    visitaApi.imagenes += 1;
    return of({ success: false, msg: 'no guardada' });
  },
  urlDocumento: (nombre: string) => `http://saul.local/upload/documentos/${nombre}`,
};

describe('Gestion', () => {
  let component: Gestion;
  let fixture: ComponentFixture<Gestion>;

  beforeEach(async () => {
    visitaApi.enviados = [];
    visitaApi.imagenes = 0;
    await TestBed.configureTestingModule({
      imports: [Gestion],
      providers: [
        VisitaLimpiaService,
        {
          provide: VisitaService,
          useValue: visitaApi,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ idVisita: '3931' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Gestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('conserva solo el texto de celda que no repite fila ni columna', () => {
    const campo = {
      id: 1,
      codigo: 'v6_pago',
      nombre: 'Impuesto predial',
      tipo: 'texto-min',
      label: 'Impuesto predial',
      dominio: null,
      opciones: null,
      descripcion: null,
      soloLectura: false,
      valor: null,
    };

    expect(component.etiquetaAdicional(campo, 'Valor', 'Impuesto predial')).toBe('');
    expect(component.etiquetaAdicional({ ...campo, label: 'Valor' }, 'Valor', 'Impuesto predial')).toBe('');
    expect(
      component.etiquetaAdicional({ ...campo, label: 'Valor en pesos' }, 'Valor', 'Impuesto predial'),
    ).toBe('Valor en pesos');
    expect(component.etiquetaAccesible('Impuesto predial', 'Valor', 'Valor en pesos')).toBe(
      'Impuesto predial, Valor, Valor en pesos',
    );
  });

  it('oculta las etiquetas repetidas en todas las tablas y las conserva fuera de ellas', () => {
    const pago = {
      id: 10,
      codigo: 'v6_predial_valor',
      nombre: 'Impuesto predial',
      tipo: 'texto-min',
      label: 'Impuesto predial',
      dominio: null,
      opciones: null,
      descripcion: null,
      soloLectura: false,
      valor: '12000',
    };
    const estado = {
      id: 11,
      codigo: 'v6_predial_estado',
      nombre: 'Impuesto predial',
      tipo: 'select-one',
      label: 'Estado del pago',
      dominio: null,
      opciones: ['Al día', 'En mora'],
      descripcion: null,
      soloLectura: false,
      valor: 'Al día',
    };
    const direccion = {
      id: 20,
      codigo: 'v6_direccion',
      nombre: 'Dirección',
      tipo: 'texto-min',
      label: null,
      dominio: null,
      opciones: null,
      descripcion: null,
      soloLectura: false,
      valor: 'Calle 10',
    };

    component.idVisita = 1;
    component.dataForm.set([
      {
        id: 1,
        nombre: 'Verificación de pagos',
        posicion: 1,
        descripcion: null,
        creadoEn: null,
        actualizadoEn: null,
        campos: [pago, estado],
        tabla: {
          encabezados: ['Ítem', 'Valor', 'Estado'],
          tituloIndependiente: true,
          filas: [{ titulo: 'Impuesto predial', celdas: [pago, estado] }],
        },
      },
      {
        id: 2,
        nombre: 'Datos',
        posicion: 2,
        descripcion: null,
        creadoEn: null,
        actualizadoEn: null,
        campos: [direccion],
        tabla: null,
      },
    ]);
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    const etiquetasTabla = [...raiz.querySelectorAll('.gestion-tabla label')];
    expect(etiquetasTabla).toHaveLength(2);
    expect(etiquetasTabla.every((etiqueta) => etiqueta.classList.contains('campo-etiqueta--oculta'))).toBe(
      true,
    );
    expect(etiquetasTabla[1].textContent).toContain('Impuesto predial, Estado, Estado del pago');
    expect(raiz.querySelectorAll('.gestion-celda__detalle')).toHaveLength(1);
    expect(raiz.querySelector('.gestion-celda__detalle')?.textContent).toContain('Estado del pago');
    expect(raiz.querySelector('.gestion-campo label')?.classList.contains('campo-etiqueta--oculta')).toBe(
      false,
    );
    expect(raiz.querySelector('.gestion-campo label')?.textContent).toContain('Dirección');
  });

  it('guarda el texto al perder el foco y aplica el valor devuelto', () => {
    const campo = campoTexto(20, 'v6_direccion', 'Dirección', '');
    component.dataForm.set([categoriaRegistro([campo])]);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#campo-20') as HTMLInputElement;
    input.value = 'Calle 20';
    input.dispatchEvent(new Event('blur'));

    expect(visitaApi.enviados).toEqual([{ codigo: 'v6_direccion', valor: 'Calle 20' }]);
    expect(campo.valor).toBe('guardado-servidor');
  });

  it('envía la fecha con el formato de America/Bogota', () => {
    const campo = { ...campoTexto(21, 'v_fecha', 'Fecha', '2026-10-20'), tipo: 'fecha' };
    component.dataForm.set([categoriaRegistro([campo])]);
    component.saveItem(campo);

    expect(visitaApi.enviados[0].codigo).toBe('v_fecha');
    expect(visitaApi.enviados[0].valor).toBe(
      new Date('2026-10-20').toLocaleString('en-US', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }),
    );
    expect(campo.valor).toBe('guardado-servidor');
  });

  it('no envía una imagen con extensión distinta de png, jpeg o jpg', () => {
    const campo = campoImagen(30, 'v13_imagen_fachada', 'Foto fachada', null);
    const archivo = new File(['img'], 'fachada.gif', { type: 'image/gif' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [archivo] });

    component.onArchivoSeleccionado(campo, { target: input } as unknown as Event);

    expect(visitaApi.imagenes).toBe(0);
    expect(component.mensajeError).toContain('PNG, JPEG o JPG');
    expect(campo.valor).toBeNull();
  });

  it('conserva la imagen guardada al quitar una selección pendiente', () => {
    const campo = {
      id: 30,
      codigo: 'v13_imagen_fachada',
      nombre: 'Foto fachada',
      tipo: 'imagen',
      label: null,
      dominio: null,
      opciones: null,
      descripcion: null,
      soloLectura: false,
      valor: 'fachada-guardada.png',
    };
    const archivo = new File(['img'], 'fachada.png', { type: 'image/png' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [archivo] });

    component.idVisita = 9;
    component.onArchivoSeleccionado(campo, { target: input } as unknown as Event);

    expect(component.archivoPendiente(campo.codigo)).toBe(archivo);
    expect(component.vistaPrevia(campo.codigo)).toContain('blob:');
    expect(campo.valor).toBe('fachada-guardada.png');

    component.limpiarSeleccion(campo);

    expect(component.archivoPendiente(campo.codigo)).toBeNull();
    expect(campo.valor).toBe('fachada-guardada.png');
  });

  it('renderiza un par de registro', () => {
    component.idVisita = 9;
    component.dataForm.set([
      categoriaRegistro([
        campoImagen(2, 'v13_imagen_registro1', 'FOTO No. 1', 'foto-1.png'),
        campoTexto(3, 'v13_descripcion_registro1', 'Descripción FOTO No. 1', 'norte'),
      ]),
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.gestion-registro').length).toBe(1);
  });

  it('renderiza fachada y dos pares', () => {
    component.idVisita = 9;
    component.dataForm.set([
      categoriaRegistro([
        campoImagen(1, 'v13_imagen_fachada', 'Foto fachada', null),
        campoImagen(2, 'v13_imagen_registro1', 'FOTO No. 1', 'foto-1.png'),
        campoTexto(3, 'v13_descripcion_registro1', 'Descripción FOTO No. 1', 'norte'),
        campoImagen(4, 'v13_imagen_registro2', 'FOTO No. 2', 'foto-2.png'),
        campoTexto(5, 'v13_descripcion_registro2', 'Descripción FOTO No. 2', ''),
      ]),
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.gestion-registro').length).toBe(1);
  });

  it('renderiza un registro suelto', () => {
    component.idVisita = 9;
    component.dataForm.set([
      categoriaRegistro([
        campoImagen(10, 'v13_imagen_registro5', 'FOTO No. 5', 'foto-5.png'),
        campoTexto(11, 'v13_descripcion_registro5', 'Descripción FOTO No. 5', ''),
      ]),
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.w-100.d-none.d-md-block')).not.toBeNull();
  });

  it('renderiza dos filas de pares', () => {
    component.idVisita = 9;
    component.dataForm.set([
      categoriaRegistro([
        campoImagen(2, 'v13_imagen_registro1', 'FOTO No. 1', 'foto-1.png'),
        campoTexto(3, 'v13_descripcion_registro1', 'Descripción FOTO No. 1', 'norte'),
        campoImagen(4, 'v13_imagen_registro2', 'FOTO No. 2', null),
        campoTexto(5, 'v13_descripcion_registro2', 'Descripción FOTO No. 2', ''),
        campoImagen(6, 'v13_imagen_registro3', 'FOTO No. 3', null),
        campoTexto(7, 'v13_descripcion_registro3', 'Descripción FOTO No. 3', ''),
        campoImagen(8, 'v13_imagen_registro4', 'FOTO No. 4', 'foto-4.png'),
        campoTexto(9, 'v13_descripcion_registro4', 'Descripción FOTO No. 4', ''),
        campoImagen(10, 'v13_imagen_registro5', 'FOTO No. 5', null),
        campoTexto(11, 'v13_descripcion_registro5', 'Descripción FOTO No. 5', ''),
      ]),
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.gestion-registro').length).toBe(3);
  });

  it('alinea cada imagen con la columna de su descripción', () => {
    const fachada = campoImagen(1, 'v13_imagen_fachada', 'Foto fachada', null);
    const foto1 = campoImagen(2, 'v13_imagen_registro1', 'FOTO No. 1', 'foto-1.png');
    const desc1 = campoTexto(3, 'v13_descripcion_registro1', 'Descripción FOTO No. 1', 'Fachada norte');
    const foto2 = campoImagen(4, 'v13_imagen_registro2', 'FOTO No. 2', null);
    const desc2 = campoTexto(5, 'v13_descripcion_registro2', 'Descripción FOTO No. 2', '');
    const foto3 = campoImagen(6, 'v13_imagen_registro3', 'FOTO No. 3', null);
    const desc3 = campoTexto(7, 'v13_descripcion_registro3', 'Descripción FOTO No. 3', '');
    const nombreLargo = 'plano-de-localizacion-con-un-nombre-extremadamente-largo-que-no-debe-desbordar.png';
    const foto4 = campoImagen(8, 'v13_imagen_registro4', 'FOTO No. 4', nombreLargo);
    const desc4 = campoTexto(9, 'v13_descripcion_registro4', 'Descripción FOTO No. 4', '');
    const foto5 = campoImagen(10, 'v13_imagen_registro5', 'FOTO No. 5', null);
    const desc5 = campoTexto(11, 'v13_descripcion_registro5', 'Descripción FOTO No. 5', '');

    component.idVisita = 9;
    component.dataForm.set([
      {
        id: 8,
        nombre: 'Registros fotográficos',
        posicion: 1,
        descripcion: null,
        creadoEn: null,
        actualizadoEn: null,
        campos: [fachada, foto1, desc1, foto2, desc2, foto3, desc3, foto4, desc4, foto5, desc5],
        tabla: null,
      },
    ]);
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    const filas = [...raiz.querySelectorAll('.gestion-registro')];
    expect(filas).toHaveLength(3);
    expect(idsEnOrden(filas[0])).toEqual(['campo-2', 'campo-3', 'campo-4', 'campo-5']);
    expect(idsEnOrden(filas[1])).toEqual(['campo-6', 'campo-7', 'campo-8', 'campo-9']);
    expect(idsEnOrden(filas[2])).toEqual(['campo-10', 'campo-11']);

    expect(columna(filas[0], 'campo-2').classList.contains('order-md-1')).toBe(true);
    expect(columna(filas[0], 'campo-4').classList.contains('order-md-2')).toBe(true);
    expect(columna(filas[0], 'campo-3').classList.contains('order-md-3')).toBe(true);
    expect(columna(filas[0], 'campo-5').classList.contains('order-md-4')).toBe(true);
    expect(columna(filas[0], 'campo-2').className).toContain('col-md-6');
    expect(columna(filas[0], 'campo-3').className).toContain('col-md-6');
    expect(filas[2].querySelector('.w-100.d-none.d-md-block')).not.toBeNull();
    expect(raiz.querySelector('#campo-1')?.closest('.gestion-registro')).toBeNull();

    const selector = raiz.querySelector('#campo-2') as HTMLInputElement;
    expect(selector.type).toBe('file');
    expect(raiz.querySelector('label[for="campo-2"]')?.textContent).toContain('FOTO No. 1');
    expect(columna(filas[0], 'campo-2').querySelector('.gestion-archivo')?.classList.contains('form-control')).toBe(
      true,
    );
    expect(columna(filas[0], 'campo-2').querySelector('.gestion-archivo__nombre')?.textContent).toBe('foto-1.png');
    expect(columna(filas[0], 'campo-2').querySelector('img')?.getAttribute('src')).toContain('foto-1.png');
    expect(columna(filas[0], 'campo-4').querySelector('.gestion-archivo__nombre')?.textContent).toBe(
      'Ningún archivo seleccionado',
    );

    const archivo = new File(['img'], nombreLargo, { type: 'image/png' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [archivo] });
    component.onArchivoSeleccionado(foto4, { target: input } as unknown as Event);
    fixture.detectChanges();

    const grupoPendiente = columna(filas[1], 'campo-8');
    expect(grupoPendiente.querySelector('.gestion-archivo__nombre')?.textContent).toBe(nombreLargo);
    expect(grupoPendiente.querySelector('img')?.getAttribute('alt')).toContain(nombreLargo);
    expect(grupoPendiente.textContent).toContain('Quitar selección');
    expect(foto4.valor).toBe(nombreLargo);
  });
});

function idsEnOrden(fila: Element): string[] {
  return [...fila.querySelectorAll('[id^="campo-"]')].map((elemento) => elemento.id);
}

function columna(fila: Element, id: string): HTMLElement {
  const campo = fila.querySelector(`#${id}`)?.closest('.gestion-campo');
  if (!(campo instanceof HTMLElement)) {
    throw new Error(`No está la columna ${id}`);
  }
  return campo;
}

function categoriaRegistro(campos: ReturnType<typeof campoImagen>[]) {
  return {
    id: 8,
    nombre: 'Registros fotográficos',
    posicion: 1,
    descripcion: null,
    creadoEn: null,
    actualizadoEn: null,
    campos,
    tabla: null,
  };
}

function campoImagen(id: number, codigo: string, nombre: string, valor: string | null) {
  return {
    id,
    codigo,
    nombre,
    tipo: 'imagen',
    label: null,
    dominio: null,
    opciones: null,
    descripcion: null,
    soloLectura: false,
    valor,
  };
}

function campoTexto(id: number, codigo: string, nombre: string, valor: string) {
  return {
    id,
    codigo,
    nombre,
    tipo: 'texto-min',
    label: null,
    dominio: null,
    opciones: null,
    descripcion: null,
    soloLectura: false,
    valor,
    clase: 'col-md-6',
  };
}
