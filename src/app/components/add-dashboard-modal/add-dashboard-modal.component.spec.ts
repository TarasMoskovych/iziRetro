import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDashboardModalComponent } from './add-dashboard-modal.component';

describe('AddDashboardModalComponent', () => {
  let component: AddDashboardModalComponent;
  let fixture: ComponentFixture<AddDashboardModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDashboardModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDashboardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
