import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColaboraEmpresaComponent } from './colabora-empresa.component';

describe('ColaboraEmpresaComponent', () => {
  let component: ColaboraEmpresaComponent;
  let fixture: ComponentFixture<ColaboraEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColaboraEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColaboraEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
