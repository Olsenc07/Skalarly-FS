import { AuthorizeService } from 'src/app/custom-architecture-aids/services/authorize.service';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthorizeService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  canActivate(): boolean {
    const isAuth: boolean = this.authService.getIsAuth();
    if (!isAuth) {
      this.router.navigate(['/login']);
      if (window.location.href !== 'https://www.skalarly.com/login') {
        const snackBarRef = this.snackBar.open(
          'Skalarly requries an account to access',
          "Create an account to see what you'r missing",
          {
            duration: 3000
          }
        );
        snackBarRef.onAction().subscribe(() => {
          this.router.navigate(['/sign-up']);
        });
      }
    }
    return isAuth;
  }
}
