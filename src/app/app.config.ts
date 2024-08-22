import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TetrisGameComponent } from './tetris-game/tetris-game.component';
import { IntroPageComponent } from './intro-page/intro-page.component';
import { PlayerDataGuardService } from './player-data-guard.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: 'intro', component: IntroPageComponent },
      {
        path: 'game/',
        component: TetrisGameComponent,
        canActivate: [PlayerDataGuardService],
      },
      {
        path: 'game/:colors',
        component: TetrisGameComponent,
        canActivate: [PlayerDataGuardService],
      },
      { path: '**', redirectTo: 'intro' },
    ]),
    provideHttpClient(),
    PlayerDataGuardService,
  ],
};
