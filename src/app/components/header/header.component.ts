import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { FirebaseUser } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  user$: Observable<FirebaseUser> = this.authService.getFirebaseUser();

  constructor(private authService: AuthService) { }

  onLogout(): void {
    this.authService.logout()
      .pipe(take(1))
      .subscribe();
  }
}
