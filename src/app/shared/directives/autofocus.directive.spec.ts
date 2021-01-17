import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AutofocusDirective } from './autofocus.directive';

@Component({
  template: `<input appAutofocus type="text" />`
})
class TestHostComponent {}

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: AutofocusDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, AutofocusDirective],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    directive = fixture.debugElement.query(By.css('input')).injector.get(AutofocusDirective);

    spyOn(directive['el'].nativeElement, 'focus');
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should focus input', waitForAsync(() => {
    fixture.whenStable().then(() => {
      expect(directive['el'].nativeElement.focus).toHaveBeenCalled();
    });
  }));
});
