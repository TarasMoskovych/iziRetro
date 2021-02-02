import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BoardEditItemComponent } from './board-edit-item.component';

describe('BoardEditItemComponent', () => {
  let component: BoardEditItemComponent;
  let fixture: ComponentFixture<BoardEditItemComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoardEditItemComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardEditItemComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('add', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render "Add" button text', () => {
      expect(el.query(By.css('.board-edit-item__btn')).nativeElement.textContent).toContain('Add');
    });

    it('should not render remove button', () => {
      expect(el.queryAll(By.css('[aria-label="Remove"]')).length).toBe(0);
    });

    it('should close edit view', () => {
      spyOn(component.close, 'emit');

      el.query(By.css('.board-edit-item__icon')).nativeElement.click();
      expect(component.close.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('edit', () => {
    beforeEach(() => {
      component.value = 'Test';
      fixture.detectChanges();
    });

    it('should render "Save" button text', () => {
      expect(el.query(By.css('.board-edit-item__btn')).nativeElement.textContent).toContain('Save');
    });

    it('should render remove button', () => {
      expect(el.queryAll(By.css('[aria-label="Remove"]')).length).toBe(1);
    });

    it('should save item', () => {
      spyOn(component.save, 'emit');

      el.query(By.css('.board-edit-item__btn')).nativeElement.click();
      expect(component.save.emit).toHaveBeenCalledOnceWith(component.value);
    });

    it('should remove item', () => {
      spyOn(component.remove, 'emit');

      el.query(By.css('[aria-label="Remove"]')).nativeElement.click();
      expect(component.remove.emit).toHaveBeenCalledTimes(1);
    });
  });
});
