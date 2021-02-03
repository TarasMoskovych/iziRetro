import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { dashBoardSorts } from 'src/app/models';
import { DashboardPanelActionsComponent } from './dashboard-panel-actions.component';

describe('DashboardPanelActionsComponent', () => {
  let component: DashboardPanelActionsComponent;
  let fixture: ComponentFixture<DashboardPanelActionsComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardPanelActionsComponent ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPanelActionsComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default inputs', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should not display add button when user is not a creator', () => {
      expect(el.queryAll(By.css('.dashboard-panel-actions__add')).length).toBe(0);
    });

    it('should not display sorts select', () => {
      expect(el.queryAll(By.css('mat-select')).length).toBe(0);
    });
  });

  it('should emit createBoard on button click', () => {
    spyOn(component.createBoard, 'emit');

    component.creator = true;
    fixture.detectChanges();
    el.query(By.css('.dashboard-panel-actions__add')).triggerEventHandler('click', null);

    expect(component.createBoard.emit).toHaveBeenCalled();
  });

  describe('search', () => {
    let input: HTMLInputElement;
    let actionsWrapper: DebugElement;

    beforeEach(() => {
      fixture.detectChanges();

      input = el.query(By.css('input')).nativeElement;
      actionsWrapper = el.query(By.css('.dashboard-panel-actions__right'));
    });

    it('should emit search on keyUp event', () => {
      spyOn(component.search, 'emit');
      expect(actionsWrapper.query(By.css('button'))).toBeNull();

      input.value = 'Search';
      input.dispatchEvent(new KeyboardEvent('keyup'));
      fixture.detectChanges();

      expect(component.search.emit).toHaveBeenCalledOnceWith('Search');
      expect(actionsWrapper.query(By.css('button'))).toBeTruthy();
    });

    it('should emit search on clear button click', () => {
      input.value = 'Search';
      input.dispatchEvent(new KeyboardEvent('keyup'));
      fixture.detectChanges();

      spyOn(component.search, 'emit');
      actionsWrapper.query(By.css('button')).triggerEventHandler('click', null);

      expect(component.search.emit).toHaveBeenCalledOnceWith('');
    });
  });

  describe('sort', () => {
    let select: DebugElement;

    beforeEach(() => {
      component.sorts = dashBoardSorts;
      fixture.detectChanges();

      select = el.query(By.css('mat-select'))
      spyOn(component.select, 'emit');
    });

    it('should render sort options', () => {
      expect(select.queryAll(By.css('mat-option')).length).toBe(dashBoardSorts.length);
    });

    it('should render correct option', () => {
      expect(select.query(By.css('mat-option')).nativeElement.textContent).toContain('Date (Asc)');
    });

    it('should emit select on selectionChange event', () => {
      select.triggerEventHandler('selectionChange', { value: dashBoardSorts[1].value });

      expect(component.select.emit).toHaveBeenCalledOnceWith(dashBoardSorts[1].value);
    });
  });
});
