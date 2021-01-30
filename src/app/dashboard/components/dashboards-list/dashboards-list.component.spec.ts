import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { boards } from 'src/app/mocks';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashBoardsListComponent } from './dashboards-list.component';

describe('DashBoardsListComponent', () => {
  let component: DashBoardsListComponent;
  let fixture: ComponentFixture<DashBoardsListComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule
      ],
      declarations: [DashBoardsListComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashBoardsListComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;

    component.creator = true;
    component.boards = boards;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render menu when user is not creator', () => {
    component.creator = false;
    fixture.detectChanges();

    expect(el.queryAll(By.css('.dashboards-list__item-menu')).length).toBe(0);
  });

  it('should render menu when user is creator', () => {
    fixture.detectChanges();

    expect(el.queryAll(By.css('.dashboards-list__item-menu')).length).toBe(boards.length);
  });

  describe('emitters', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit shareUrl', () => {
      spyOn(component.shareUrl, 'emit');

      component.onShareUrl(boards[0]);
      expect(component.shareUrl.emit).toHaveBeenCalledOnceWith(boards[0]);
    });

    it('should emit freeze', () => {
      spyOn(component.freeze, 'emit');

      component.onFreeze(boards[0]);
      expect(component.freeze.emit).toHaveBeenCalledOnceWith(boards[0]);
    });

    it('should emit removeBoard', () => {
      spyOn(component.removeBoard, 'emit');

      component.onRemove(boards[0]);
      expect(component.removeBoard.emit).toHaveBeenCalledOnceWith(boards[0]);
    });
  });

  describe('search', () => {
    it('should show only one board', () => {
      component.searchQuery = 'es';
      fixture.detectChanges();

      expect(el.queryAll(By.css('.dashboards-list__item-wrapper')).length).toBe(1);
      expect(el.query(By.css('.dashboards-list__item-title')).nativeElement.textContent).toContain('test');
    });

    it('should hide all boards when no results', () => {
      component.searchQuery = 'qwerty';
      fixture.detectChanges();

      expect(el.queryAll(By.css('.dashboards-list__item-wrapper')).length).toBe(0);
    });

    afterEach(() => {
      expect(component.boards.length).toBe(boards.length);
    });
  });

  describe('sort', () => {
    let titles: DebugElement[];

    const getTitles = () => {
      titles = el.queryAll(By.css('.dashboards-list__item-title'));
    };

    const getLink = (title: DebugElement) => title.nativeElement.getAttribute('ng-reflect-router-link');

    it('should sort boards by date in ascending order', () => {
      component.sort = { asc: true, value: 'date' };
      fixture.detectChanges();
      getTitles();

      expect(getLink(titles[0])).toBe('/dashboard,1');
      expect(getLink(titles[2])).toBe('/dashboard,2');
    });

    it('should sort boards by date in descending order', () => {
      component.sort = { asc: false, value: 'date' };
      fixture.detectChanges();
      getTitles();

     expect(getLink(titles[0])).toBe('/dashboard,2');
     expect(getLink(titles[2])).toBe('/dashboard,1');
    });

    it('should sort boards by title in ascending order', () => {
      component.sort = { asc: true, value: 'title' };
      fixture.detectChanges();
      getTitles();

      expect(getLink(titles[0])).toBe('/dashboard,1');
      expect(getLink(titles[2])).toBe('/dashboard,2');
    });

    it('should sort boards by title in descending order', () => {
      component.sort = { asc: false, value: 'title' };
      fixture.detectChanges();
      getTitles();

      expect(getLink(titles[0])).toBe('/dashboard,2');
      expect(getLink(titles[2])).toBe('/dashboard,1');
    });
  });
});
