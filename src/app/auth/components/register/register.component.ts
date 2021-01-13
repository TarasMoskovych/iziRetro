import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private loading = new Subject<boolean>();

  form: FormGroup;
  loading$ = this.loading.asObservable();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  onSubmit(): void {
    this.loading.next(true);

    this.authService.register(this.form.value)
      .pipe(take(1))
      .subscribe(
        () => this.router.navigate(['login'], { queryParamsHandling: 'preserve' }),
        () => this.loading.next(false),
      );
  }

  private buildForm(): void {
    this.form = new FormGroup({
      displayName: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    });
  }

}
