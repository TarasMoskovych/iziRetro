import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPanelComponent } from './dashboard-panel.component';

xdescribe('DashboardPanelComponent', () => {
  let component: DashboardPanelComponent;
  let fixture: ComponentFixture<DashboardPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
