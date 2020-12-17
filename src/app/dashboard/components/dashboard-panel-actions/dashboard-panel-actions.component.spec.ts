import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPanelActionsComponent } from './dashboard-panel-actions.component';

describe('DashboardPanelActionsComponent', () => {
  let component: DashboardPanelActionsComponent;
  let fixture: ComponentFixture<DashboardPanelActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardPanelActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPanelActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
