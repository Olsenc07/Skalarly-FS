import { BehaviorSubject, Observable, of, shareReplay } from 'rxjs'
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { HttpClient, HttpParams } from '@angular/common/http'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ReauthorizeComponent } from '../reauthorize/reauthorize.component'
import { Router } from '@angular/router'
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeService {
  redirectUrl: string = ''
  private apiUrl = environment.apiUrl
  // these variables don't require reactivity/async data
  userId: string | null = null
  isAuthenticated: boolean = false
  // Subjects
  private tokenSubject$: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null)
  // Observables
  token$: Observable<string | null> = this.tokenSubject$.pipe(shareReplay(1))
  // path of url
  private currentRoute: string = ''

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  //  recieved credentials
  getUserId(): string | null {
    return this.userId
  }
  getIsAuth(): boolean {
    return this.isAuthenticated
  }
  // search email on login
  searchEmails(email: string): Observable<boolean> {
    const queryParams: HttpParams = new HttpParams({ fromString: email })
    return this.http.get<boolean>(this.apiUrl + '/authorize/emailValidation', {
      params: queryParams
    })
  }
  // Login
  login(
    email: string,
    password: string,
    stayLoggedIn?: boolean
  ): Observable<boolean> {
    const authData: any = { email, password, stayLoggedIn }
    console.log('stayLoggedIn', stayLoggedIn)
    this.http
      .post<{
        token: string
        expiresIn: number
        userId: string
      }>(this.apiUrl + '/authorize/login', authData)
      .subscribe({
        next: (response) => {
          if (response.token) {
            this.tokenSubject$.next(response.token)
            this.userId = response.userId
            this.isAuthenticated = true
            //  look over and add clean up for subjects and obs
            this.setAuthTimer(response.expiresIn)
            const expirationDate = new Date(
              new Date().getTime() + response.expiresIn
            )
            this.saveAuthData(response.token, expirationDate, response.userId)

            const redirectUrl = this.redirectUrl ? this.redirectUrl : '/home'
            this.router.navigate([redirectUrl])
            this.snackBar.open('Welcome Fellow Skalar🎓', '', {
              duration: 3000
            })
            this.redirectUrl = ''
            return true
          } else {
            // failed login
            return false
          }
        },
        error: (error) => {
          this.tokenSubject$.next(null)
          this.userId = null
          this.isAuthenticated = false
        }
      })
    // default return false to handle sync case when login fails immdediately
    return of(false)
  }
  // stay loggedin.. fix ths
  stayLoggedIn(): void {
    const Id = this.userId
    console.log('followed by userId', Id)
    const sub = this.http
      .post<{
        token: string
        expiresIn: number
        userId: string
      }>(this.apiUrl + '/authorize/stayLoggedIn', Id)
      .subscribe({
        next: (response) => {
          if (response.token) {
            this.snackBar.open('Thanks for reauthorizing yourself', '✅ ', {
              duration: 3000
            })
            const expiresInDuration = response.expiresIn
            this.setAuthTimer(expiresInDuration)
            this.isAuthenticated = true
            this.userId = response.userId
            const now = new Date()
            const expirationDate = new Date(now.getTime() + expiresInDuration)
            this.saveAuthData(response.token, expirationDate, this.userId)
            sub.unsubscribe()
            console.log('love you reauthorized')
          }
        },
        error: (error) => {
          this.isAuthenticated = false
          // this.snackBar.open('Failed to login, please try again', 'Will do!!', {
          //     duration: 4000
          // });
        }
      })
  }

  private setAuthTimer(duration: number): void {
    const warningTime = duration - 30000 // 30 seconds before expiration
    this.ngZone.runOutsideAngular(() => {
    setTimeout(() => {
      // Calculate the remaining time in seconds
      const remainingTime = Math.floor((duration - Date.now()) / 1000)
      // Display a warning dialog when there are 30 seconds left
      const dialogRef = this.dialog.open(ReauthorizeComponent, {
        data: { remainingTime }
      })
      // Subscribe to dialog result or actions if needed
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'extend') {
          // reassign setAuthTimer
          this.setAuthTimer(warningTime)
        } else {
          // User didn't extend, you can handle this case accordingly
          // logout when time runs out
          // this.logout()
          this.snackBar.open('Validation Expired', 'Please Relogin', {
            duration: 3000
          })
        }
      })
    }, warningTime)
  })
  }

  // needs to be triggered whenever one of these values change
  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string
  ): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token)
      localStorage.setItem('expiration', expirationDate.toISOString())
      localStorage.setItem('userId', userId)
    }
  }
  public getAuthData(): any {
    const token = localStorage.getItem('token')
    this.tokenSubject$.next(token)
    this.userId = localStorage.getItem('userId')
  }
  // access removal
  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token')
      localStorage.removeItem('expiration')
      localStorage.removeItem('userId')
    }
  }

  // clean up
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentRoute = document.URL
      console.log('current url', this.currentRoute)
      if (
        this.currentRoute !== 'http://localhost:4200/login' &&
        this.currentRoute !== 'https://www.skalarly.com/login'
      ) {
        this.router.navigate(['/login'])
      }
      this.tokenSubject$.next(null)
      this.isAuthenticated = false
      this.userId = null
      // change activity status to false

      // clear local storage
      this.clearAuthData()
    }
  }
}
