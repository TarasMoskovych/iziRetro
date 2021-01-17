import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { FirebaseUserInfo } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { LoginComponent } from './login.component';

const userData: FirebaseUserInfo = {
  displayName: 'test name',
  email: 'abc@gmail.com',
  phoneNumber: '1234',
  photoURL: null,
  providerId: '1',
  uid: '1',
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let el: DebugElement;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn', 'login', 'navigateToDashboard'], ['userData']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ LoginComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sign in with google provider', () => {
    authServiceSpy.signIn.and.returnValue(of(userData));
    el.query(By.css('.login__google-btn')).triggerEventHandler('click', null);

    expect(authServiceSpy.signIn).toHaveBeenCalled();
  });

  describe('sign in with email and password', () => {
    const formData = { email: 'abc@gmail.com', password: '111111' };
    let btn: DebugElement;
    let email: HTMLInputElement;
    let password: HTMLInputElement;
    let loading: boolean;

    beforeEach(() => {
      btn = el.query(By.css('.login__login-btn'));
      email = el.query(By.css('[formcontrolname="email"]')).nativeElement;
      password = el.query(By.css('[formcontrolname="password"]')).nativeElement;
    });

    const setValuesAndSubmitForm = () => {
      email.value = formData.email;
      email.dispatchEvent(new Event('input'));
      password.value = formData.password;
      password.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      btn.nativeElement.click();
    };

    it('should not sign in when form is invalid', () => {
      authServiceSpy.login.and.returnValue(of(userData));
      btn.nativeElement.click();

      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should successfully sign in when form is valid', () => {
      authServiceSpy.login.and.returnValue(of(userData));

      component.loading$.subscribe((isVisible: boolean) => loading = isVisible);
      setValuesAndSubmitForm();

      expect(authServiceSpy.navigateToDashboard).toHaveBeenCalled();
      expect(loading).toBeTrue();
      expect(authServiceSpy.login).toHaveBeenCalledOnceWith({ ...formData });
    });

    it('should unsuccessfully sign in when form is valid', () => {
      authServiceSpy.login.and.returnValue(throwError(new Error('Error during sign in.')));

      component.loading$.subscribe((isVisible: boolean) => loading = isVisible);
      setValuesAndSubmitForm();

      expect(authServiceSpy.navigateToDashboard).not.toHaveBeenCalled();
      expect(loading).toBeFalsy();
      expect(authServiceSpy.login).toHaveBeenCalledOnceWith({ ...formData });
    });
  });
});
