import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipiosComponent } from './municipios.component';

describe('MunicipiosComponent', () => {
  let component: MunicipiosComponent;
  let fixture: ComponentFixture<MunicipiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MunicipiosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MunicipiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
