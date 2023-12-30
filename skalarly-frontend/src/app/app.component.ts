import { Component, OnDestroy, WritableSignal, signal } from '@angular/core';
import {
  NavigationEnd,
  Router,
  Event as RouterEvent,
  RouterModule,
  TitleStrategy
} from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { CustomTitleStrategy } from './assistant-level-code/custom-architecture-aids/services/router-strategies/title-strategy.service';
import { OrientationService } from './assistant-level-code/custom-architecture-aids/services/orientation.service';
import { NavBarComponent } from './nav-bar/nav-bar.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterModule,
    NavBarComponent
  ],
  providers: [{ provide: TitleStrategy, useClass: CustomTitleStrategy }]
})
export class AppComponent implements OnDestroy {
  private routeSub$: Subject<void> = new Subject<void>();
  routerUrl: string | undefined;

  orientation: WritableSignal<boolean> = signal(true);
  constructor(private router: Router,
    protected orientationService: OrientationService) {
    // tracking skalars current page
    this.router.events
      .pipe(
        filter(
          (event: RouterEvent): event is NavigationEnd =>
            event instanceof NavigationEnd
        ),
        takeUntil(this.routeSub$)
      )
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe((event: NavigationEnd) => {
        this.routerUrl = event.url;
      });
  }

  ngOnDestroy(): void {
    // Trigger the unsubscribe$ to complete the subscription
    this.routeSub$.next();
    this.routeSub$.complete();
  }
}
