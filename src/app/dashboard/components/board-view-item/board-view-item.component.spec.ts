import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardViewItemComponent } from './board-view-item.component';

describe('BoardViewItemComponent', () => {
  let component: BoardViewItemComponent;
  let fixture: ComponentFixture<BoardViewItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardViewItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardViewItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
