import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { RegisterComponent } from './register.component';
import { firebaseUserInfo } from 'src/app/mocks';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let el: DebugElement;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      declarations: [ RegisterComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('register', () => {
    const data = {
      displayName: 'Test',
      email: 'abc@gmail.com',
      password: '111111',
    };
    let loading: boolean;
    let btn: DebugElement;

    beforeEach(() => {
      btn = el.query(By.css('.register__register-btn'));

      spyOn(router, 'navigate');
    });

    const setValuesAndSubmitForm = () => {
      const displayName: HTMLInputElement = el.query(By.css(`[formcontrolname="displayName"]`)).nativeElement;
      const email: HTMLInputElement = el.query(By.css(`[formcontrolname="email"]`)).nativeElement;
      const password: HTMLInputElement = el.query(By.css(`[formcontrolname="password"]`)).nativeElement;

      displayName.value = data.displayName;
      displayName.dispatchEvent(new Event('input'));
      email.value = data.email;
      email.dispatchEvent(new Event('input'));
      password.value = data.password;
      password.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      btn.nativeElement.click();
    };

    it('should not register when form is invalid', () => {
      btn.nativeElement.click();

      expect(authServiceSpy.register).not.toHaveBeenCalled();
    });

    it('should successfully register when form is valid', () => {
      authServiceSpy.register.and.returnValue(of(firebaseUserInfo));

      component.loading$.subscribe((isVisible: boolean) => loading = isVisible);
      setValuesAndSubmitForm();

      expect(authServiceSpy.register).toHaveBeenCalledOnceWith({ ...data });
      expect(router.navigate).toHaveBeenCalled();
      expect(loading).toBeTrue();
    });

    it('should unsuccessfully register when form is valid', () => {
      authServiceSpy.register.and.returnValue(throwError(new Error('Error during registration.')));

      component.loading$.subscribe((isVisible: boolean) => loading = isVisible);
      setValuesAndSubmitForm();

      expect(authServiceSpy.register).toHaveBeenCalledOnceWith({ ...data });
      expect(router.navigate).not.toHaveBeenCalled();
      expect(loading).toBeFalse();
    });
  });
});
