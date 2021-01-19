import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FortuneComponent } from './fortune.component';

describe('FortuneComponent', () => {
  let component: FortuneComponent;
  let fixture: ComponentFixture<FortuneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FortuneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FortuneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
