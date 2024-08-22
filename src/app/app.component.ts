import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TetrisGameComponent } from './tetris-game/tetris-game.component';
import { IntroPageComponent } from './intro-page/intro-page.component';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    IntroPageComponent,
    TetrisGameComponent,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'tetris-app';

  private _router;
  constructor(router: Router) {
    this._router = router;
  }

  isIntroRoute() {
    return this._router.url === '/intro';
  }

  openGame() {
    this._router.navigate(['/game']);
  }

  name: string = '';

  showIntro = true;
  showGame = false;

  handleGameStarted(data: { name: string; email: string }) {
    this.name = data.name;
    this.showIntro = false;
    this.showGame = true;
  }

  handleGameEnded() {
    this.showIntro = true;
    this.showGame = false;
  }
}
