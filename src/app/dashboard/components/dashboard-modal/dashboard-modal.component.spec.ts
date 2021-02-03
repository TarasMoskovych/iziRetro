import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { boards } from 'src/app/mocks';
import { DashboardModalComponent } from './dashboard-modal.component';

describe('DashboardModalComponent', () => {
  let component: DashboardModalComponent;
  let fixture: ComponentFixture<DashboardModalComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: undefined },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardModalComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('mode', () => {
    it('should have disabled button and "New Board" title', () => {
      component.title = '';
      fixture.detectChanges();

      expect(el.query(By.css('button')).nativeElement.disabled).toBeTrue();
      expect(el.query(By.css('h1')).nativeElement.textContent).toContain('New Board');
    });

    it('should have enabled button and "Edit Board" title', () => {
      component.title = boards[0].title;
      fixture.detectChanges();

      expect(el.query(By.css('button')).nativeElement.disabled).toBeFalse();
      expect(el.query(By.css('h1')).nativeElement.textContent).toContain('Edit Board');
    });
  });
});
