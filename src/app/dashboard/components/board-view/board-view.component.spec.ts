import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentReference } from '@angular/fire/firestore';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderModule } from 'ngx-order-pipe';
import { of } from 'rxjs';

import { boards, columns, firebaseUser, likes, posts } from 'src/app/mocks';
import { boardSorts, Column, Sort } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { DataExportService } from 'src/app/services/data-export.service';
import { PostService } from 'src/app/services/post.service';
import { FilterPipe } from 'src/app/shared/pipes';
import { BoardViewComponent } from './board-view.component';

describe('BoardViewComponent', () => {
  let component: BoardViewComponent;
  let fixture: ComponentFixture<BoardViewComponent>;
  let el: DebugElement;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let dataExportServiceSpy: jasmine.SpyObj<DataExportService>;
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', { getFirebaseUser: of(firebaseUser) });
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getBoard', 'shareUrl']);
    dataExportServiceSpy = jasmine.createSpyObj('DataExportService', ['export']);
    postServiceSpy = jasmine.createSpyObj('PostService', ['addPost', 'editPost', 'removeLike', 'addLike', 'getPosts', 'getColumns', 'getLikes']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [OrderModule],
      declarations: [BoardViewComponent, FilterPipe],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: boards[0].id } } } },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: DataExportService, useValue: dataExportServiceSpy },
        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    dashboardServiceSpy.getBoard.and.returnValue(of(boards[0]));
    postServiceSpy.getPosts.and.returnValue(of(posts));
    postServiceSpy.getColumns.and.returnValue(of(columns));
    postServiceSpy.getLikes.and.returnValue(of(likes));

    fixture = TestBed.createComponent(BoardViewComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect to dashboard when boardId is not defined', () => {
    component['route'].snapshot.params.id = '';
    component.ngOnInit();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledOnceWith('dashboard');
  });

  describe('onLayoutChange', () => {
    let toggleButtons: DebugElement[];
    let columnsWrapper: DebugElement;

    beforeEach(() => {
      fixture.detectChanges();
      toggleButtons = el.queryAll(By.css('mat-button-toggle'));
      columnsWrapper = el.query(By.css('.board__columns-wrapper'));
    });

    it('should change layout to vertical', () => {
      toggleButtons[1].triggerEventHandler('change', { value: 'VERTICAL' });
      fixture.detectChanges();

      expect(component.verticalLayout).toBeTrue();
      expect(columnsWrapper.nativeElement.classList).toContain('flex-column');
    });

    it('should change layout to horizontal', () => {
      toggleButtons[1].triggerEventHandler('change', { value: 'HORIZONTAL' });
      fixture.detectChanges();

      expect(component.verticalLayout).toBeFalse();
      expect(columnsWrapper.nativeElement.classList).not.toContain('flex-column');
    });
  });

  describe('toggle', () => {
    it('should set true to postMap', () => {
      component.toggle(columns[0].title, true);
      expect(component.addNewPostToggleMap[columns[0].title]).toBeTrue();
    });

    it('should set false to postMap', () => {
      component.toggle(columns[0].title, false);
      expect(component.addNewPostToggleMap[columns[0].title]).toBeFalse();
    });
  });

  describe('onSaveNewItem', () => {
    beforeEach(() => {
      postServiceSpy.addPost.and.returnValue(of({} as DocumentReference));
      fixture.detectChanges();
    });

    it('should not save new item when invalid value', () => {
      component.onSaveNewItem('', columns[0]);
      expect(postServiceSpy.addPost).not.toHaveBeenCalled();
    });

    it('should save new item', () => {
      const value: string = 'New value';

      component.onSaveNewItem(value, columns[0]);
      expect(postServiceSpy.addPost).toHaveBeenCalledOnceWith({
        value,
        columnPosition: columns[0].position,
        boardId: component.boardId,
        creator: component.user.email,
      });
    });
  });

  describe('onToggleItem', () => {
    beforeEach(() => {
      fixture.detectChanges();
      expect(component.editPostToggleMap[posts[0].id as string]).toBeFalsy();
    });

    it('should not update post map', () => {
      component.onToggleItem({ post: posts[0], edit: true }, true);
      expect(component.editPostToggleMap[posts[0].id as string]).toBeFalsy();
    });

    it('should update post map', () => {
      component.onToggleItem({ post: posts[0], edit: true }, false);
      expect(component.editPostToggleMap[posts[0].id as string]).toBeTrue();
    });
  });

  describe('onEditItem', () => {
    it('should call editPost', () => {
      postServiceSpy.editPost.and.returnValue(of());
      component.onEditItem(posts[0]);

      expect(postServiceSpy.editPost).toHaveBeenCalledOnceWith(posts[0], false);
    });
  });

  describe('onSearch', () => {
    it('should emit new value of search$ observable', () => {
      const value: string = 'New value';

      spyOn(component.search$, 'next');
      component.onSearch(value);

      expect(component.search$.next).toHaveBeenCalledOnceWith(value);
    });
  });

  describe('onSort', () => {
    it('should emit new value of sort$ observable', () => {
      const value: Sort = boardSorts[0];

      spyOn(component.sort$, 'next');
      component.onSort(value);

      expect(component.sort$.next).toHaveBeenCalledOnceWith(value);
    });
  });

  describe('onShareUrl', () => {
    it('should share url on button click', () => {
      fixture.detectChanges();
      el.query(By.css('[aria-label="Share"]')).triggerEventHandler('click', null);

      expect(dashboardServiceSpy.shareUrl).toHaveBeenCalledOnceWith(boards[0]);
    });
  });

  describe('onExport', () => {
    it('should export file on button click', () => {
      fixture.detectChanges();
      el.query(By.css('[aria-label="Export"]')).triggerEventHandler('click', null);

      expect(dataExportServiceSpy.export).toHaveBeenCalledOnceWith(boards[0]);
    });
  });

  describe('onAddRemoveLike', () => {
    beforeEach(() => {
      postServiceSpy.addLike.and.returnValue(of({} as DocumentReference));
      postServiceSpy.removeLike.and.returnValue(of());
      fixture.detectChanges();
    });

    describe('add like', () => {
      it('should add like when user has not liked yet', () => {
        component.onAddRemoveLike(posts[1]);
      });

      it('should add like when empty likes', () => {
        component.likesMap = {};
        component.onAddRemoveLike(posts[1]);
      });

      afterEach(() => {
        expect(postServiceSpy.addLike).toHaveBeenCalledOnceWith({
          boardId: posts[1].boardId,
          postId: posts[1].id,
          user: {
            displayName: component.user.displayName,
            email: component.user.email,
            photoURL: component.user.photoURL,
          },
        });
      });
    });

    it('should remove like', () => {
      component.onAddRemoveLike(posts[0]);
      expect(postServiceSpy.removeLike).toHaveBeenCalledOnceWith(likes[0]);
    });
  });

  describe('getData', () => {
    it('should update obj map to false when board is completed', () => {
      dashboardServiceSpy.getBoard.and.returnValue(of(boards[1]));

      component.addNewPostToggleMap['a'] = true;
      component.addNewPostToggleMap['b'] = true;
      component.editPostToggleMap['a'] = true;
      component.editPostToggleMap['b'] = true;

      fixture.detectChanges();

      Object.keys(component.addNewPostToggleMap).forEach((key: string) => {
        expect(component.addNewPostToggleMap[key]).toBeFalse();
      });

      Object.keys(component.editPostToggleMap).forEach((key: string) => {
        expect(component.editPostToggleMap[key]).toBeFalse();
      });
    });

    it('should skip updating columns map when true', () => {
      columns.forEach((column: Column) => component.addNewPostToggleMap[column.title] = true);
      fixture.detectChanges();

      columns.forEach((column: Column) => {
        expect(component.addNewPostToggleMap[column.title]).toBeTrue();
      });
    });
  });
});
