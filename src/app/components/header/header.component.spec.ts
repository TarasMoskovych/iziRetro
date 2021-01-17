import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { FirebaseUser } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderComponent } from './header.component';

const user: Partial<FirebaseUser> = {
  displayName: 'Test',
  emailVerified: true,
  photoURL: 'assets/logo.png',
};

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let el: DebugElement;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);

    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ HeaderComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
    })
    .compileComponents();
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    fixture.detectChanges();
  };

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should not display user image when guest', () => {
    authServiceSpy.getCurrentUser.and.returnValue(of());
    createComponent();

    expect(el.queryAll(By.css('.header__user-img')).length).toBe(0);
  });

  it('should display user image when authorized', () => {
    authServiceSpy.getCurrentUser.and.returnValue(of(user as FirebaseUser));
    createComponent();

    expect(el.queryAll(By.css('.header__user-img')).length).toBe(1);
  });

  it('should logout', () => {
    authServiceSpy.logout.and.returnValue(of());
    createComponent();
    component.onLogout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
