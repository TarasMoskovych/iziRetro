import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { firebaseUser, likes, posts } from 'src/app/mocks';
import { FirebaseUser, Like, Post } from 'src/app/models';
import { BoardViewItemComponent } from './board-view-item.component';

@Component({
  template: `
    <app-board-view-item
      color="#000"
      [edit]="edit"
      [editable]="edit"
      [likes]="likes"
      [post]="post"
      [user]="user"
      (addRemoveLike)="onAddRemoveLike($event)"
      (save)="onEditItem($event)"
      (remove)="onEditItem($event, true)"
      (toggle)="onToggleItem($event, false)"
    ></app-board-view-item>
  `
})
class TestHostComponent {
  edit = true;
  likes: Like[] = [likes[0]];
  post: Post = posts[0];
  user: FirebaseUser = firebaseUser;

  onAddRemoveLike(post: Post) {}
  onEditItem(post: Post, remove?: boolean) {}
  onToggleItem(e: { post: Post, edit: boolean }, completed: boolean) {}
}

describe('BoardViewItemComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let el: DebugElement;
  let boardViewItem: BoardViewItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestHostComponent,
        BoardViewItemComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    boardViewItem = el.query(By.directive(BoardViewItemComponent)).injector.get(BoardViewItemComponent);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('view mode', () => {
    beforeEach(() => {
      component.edit = false;
      fixture.detectChanges();
    });

    it('should render view layout', () => {
      expect(el.query(By.css('.board-view-item')).nativeElement.classList).not.toContain('board-view-item--editable');
      expect(el.query(By.css('.board-view-item > div')).nativeElement.textContent).toContain(component.post.value);
      expect(el.queryAll(By.css('app-board-edit-item')).length).toBe(0);
      expect(el.queryAll(By.css('.board-view-item__likes-wrapper')).length).toBe(1);
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render edit layout', () => {
      expect(el.query(By.css('.board-view-item')).nativeElement.classList).toContain('board-view-item--editable');
      expect(el.query(By.css('.board-view-item > div'))).toBeFalsy();
      expect(el.queryAll(By.css('app-board-edit-item')).length).toBe(1);
      expect(el.queryAll(By.css('.board-view-item__likes-wrapper')).length).toBe(0);
    });
  });

  describe('likes', () => {
    beforeEach(() => {
      component.edit = false;
    });

    it('should render likes', () => {
      fixture.detectChanges();

      expect(boardViewItem.isLiked).toBeTrue();
      expect(el.queryAll(By.css('.board-view-item__likes div')).length).toBe(component.likes.length);
      expect(el.query(By.css('.board-view-item__likes-wrapper span')).nativeElement.textContent).toContain(component.likes.length);
    });

    it('should not render likes', () => {
      component.likes = null as any;
      fixture.detectChanges();

      expect(el.queryAll(By.css('.board-view-item__likes div')).length).toBe(0);
      expect(boardViewItem.isLiked).toBeFalse();
    });
  });

  describe('onSave', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(component, 'onEditItem');

      expect(boardViewItem.edit).toBeTrue();
    });

    it('should emit save', () => {
      const value: string = 'New value';
      boardViewItem.onSave(value);

      expect(component.onEditItem).toHaveBeenCalledOnceWith({ ...component.post, value });
      expect(boardViewItem.edit).toBeFalse();
    });

    it('should not emit save when value is empty', () => {
      boardViewItem.onSave('');

      expect(component.onEditItem).not.toHaveBeenCalled();
      expect(boardViewItem.edit).toBeTrue();
    });
  });

  describe('onToggle', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(component, 'onToggleItem');
    });

    it('should emit toggle with edit mode', () => {
      el.query(By.css('.board-view-item')).triggerEventHandler('click', null);
      expect(component.onToggleItem).toHaveBeenCalledOnceWith({ post: component.post, edit: true }, false);
    });

    it('should emit toggle with view mode', () => {
      boardViewItem.onToggle(false);
      expect(component.onToggleItem).toHaveBeenCalledOnceWith({ post: component.post, edit: false }, false);
    });
  });

  describe('onAddRemoveLike', () => {
    beforeEach(() => {
      component.edit = false;
      fixture.detectChanges();
      spyOn(component, 'onAddRemoveLike');
    });

    it('should emit addRemoveLike', () => {
      el.query(By.css('.board-view-item__likes-wrapper div:nth-child(2)')).nativeElement.click();
      expect(component.onAddRemoveLike).toHaveBeenCalledOnceWith(component.post);
    });
  });

  describe('onRemove', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(component, 'onEditItem');
    });

    it('should emit remove', () => {
      boardViewItem.onRemove();
      expect(component.onEditItem).toHaveBeenCalledOnceWith(component.post, true);
    });
  });
});
