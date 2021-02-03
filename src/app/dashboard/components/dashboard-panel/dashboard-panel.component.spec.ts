import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { MaterialModule } from 'src/app/material/material.module';
import { boards } from 'src/app/mocks';
import { Sort } from 'src/app/models';
import { DashboardService } from 'src/app/services/dashboard.service';
import { DashboardModalComponent } from '../dashboard-modal/dashboard-modal.component';
import { DashboardPanelComponent } from './dashboard-panel.component';

describe('DashboardPanelComponent', () => {
  let component: DashboardPanelComponent;
  let fixture: ComponentFixture<DashboardPanelComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;
  let el: DebugElement;

  beforeEach(async () => {
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', {
      getMyBoards: of(boards),
      getBoardsSharedWithMe: of([]),
      addBoard: of(true),
      editBoard: of(true),
      removeBoard: of(true),
      shareBoard: of(true),
      shareUrl: true,
    });

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
      ],
      declarations: [ DashboardPanelComponent ],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPanelComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should share a board on init', () => {
    expect(dashboardServiceSpy.shareBoard).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should render count of the boards', () => {
    const tabs: DebugElement[] = el.queryAll(By.css('.dashboard-panel__tab'));
    const asserts = (tab: DebugElement, tabContent: string, count: number) => {
      expect(tab.nativeElement.textContent).toContain(tabContent);
      expect(tab.query(By.css('span')).nativeElement.textContent).toContain(count);
    };

    asserts(tabs[0], 'My boards', boards.length);
    asserts(tabs[1], 'Shared with Me', 0);
  });

  describe('openDashboardModal', () => {
    it('should open the modal and add new board on close', () => {
      const title: string = 'New board';

      dialogSpy.open.and.returnValue({ afterClosed: () => of(title) } as MatDialogRef<typeof component>);
      component.openDashboardModal(undefined);

      expect(dialogSpy.open).toHaveBeenCalledOnceWith(DashboardModalComponent, { data: undefined });
      expect(dashboardServiceSpy.addBoard).toHaveBeenCalledOnceWith({ title, completed: false });
    });

    it('should open the modal and edit current board on close', () => {
      const title: string = 'Updated board';

      dialogSpy.open.and.returnValue({ afterClosed: () => of(title) } as MatDialogRef<typeof component>);
      component.openDashboardModal(boards[0]);

      expect(dialogSpy.open).toHaveBeenCalledOnceWith(DashboardModalComponent, { data: boards[0].title });
      expect(dashboardServiceSpy.editBoard).toHaveBeenCalledOnceWith({ ...boards[0], title });
    });

    it('should skip actions when data is invalid', () => {
      dialogSpy.open.and.returnValue({ afterClosed: () => of(undefined) } as MatDialogRef<typeof component>);
      component.openDashboardModal();

      expect(dialogSpy.open).toHaveBeenCalledOnceWith(DashboardModalComponent, { data: undefined });
      expect(dashboardServiceSpy.addBoard).not.toHaveBeenCalled();
      expect(dashboardServiceSpy.editBoard).not.toHaveBeenCalled();
    });
  });

  describe('removeBoard', () => {
    it('should remove the board', () => {
      component.onRemoveBoard(boards[0]);
      expect(dashboardServiceSpy.removeBoard).toHaveBeenCalledOnceWith(boards[0].id);
    });
  });

  describe('shareUrl', () => {
    it('should share board url', () => {
      component.onShareUrl(boards[0]);
      expect(dashboardServiceSpy.shareUrl).toHaveBeenCalledOnceWith(boards[0]);
    });
  });

  describe('freeze', () => {
    it('should reverse completed property and edit the board', () => {
      component.onFreeze(boards[0]);
      expect(dashboardServiceSpy.editBoard).toHaveBeenCalledOnceWith({ ...boards[0], completed: !boards[0].completed });
    });
  });

  describe('boards search', () => {
    const value: string = 'new value';

    it('should emit new value of searchBoards$ observable', () => {
      spyOn(component.searchBoards$, 'next');
      component.onBoardsSearch(value, true);

      expect(component.searchBoards$.next).toHaveBeenCalledOnceWith(value);
    });

    it('should emit new value of searchSharedWithMe$ observable', () => {
      spyOn(component.searchSharedWithMe$, 'next');
      component.onBoardsSearch(value);

      expect(component.searchSharedWithMe$.next).toHaveBeenCalledOnceWith(value);
    });
  });

  describe('boards select', () => {
    const value: Sort = { asc: true, value: 'date' };

    it('should emit new value of sortBoards$ observable', () => {
      spyOn(component.sortBoards$, 'next');
      component.onBoardsSelect(value, true);

      expect(component.sortBoards$.next).toHaveBeenCalledOnceWith(value);
    });

    it('should emit new value of sortSharedWithMe$ observable', () => {
      spyOn(component.sortSharedWithMe$, 'next');
      component.onBoardsSelect(value);

      expect(component.sortSharedWithMe$.next).toHaveBeenCalledOnceWith(value);
    });
  });
});
