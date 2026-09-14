import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Descargar } from './descargar';

describe('Descargar', () => {
  let component: Descargar;
  let fixture: ComponentFixture<Descargar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Descargar],
    }).compileComponents();

    fixture = TestBed.createComponent(Descargar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
