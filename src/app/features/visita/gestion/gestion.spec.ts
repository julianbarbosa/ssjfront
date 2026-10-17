import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { VisitaLimpiaService } from '../../../core/services/visita-limpia.service';
import { VisitaService } from '../../../core/services/visita.service';
import { Gestion } from './gestion';

describe('Gestion', () => {
  let component: Gestion;
  let fixture: ComponentFixture<Gestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gestion],
      providers: [
        VisitaLimpiaService,
        {
          provide: VisitaService,
          useValue: { obtenerFormulario: () => of([]) },
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
});
