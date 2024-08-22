import { CommonModule, Location } from '@angular/common';
import {
  Component,
  HostListener,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { map, scan } from 'rxjs/operators';
import { TetrisCoreComponent, TetrisCoreModule } from 'ngx-tetris';
import { FilteredHistoryPipe } from '../filtered-history.pipe';
import { SortedAndFilteredHistoryPipe } from '../sorted-and-filtered-history.pipe';
import { PlayerDataService } from '../player-data.service';
import { TokenAuthService } from '../token-auth.service';
import { HighscoresService } from '../highscores.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-tetris-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TetrisCoreModule,
    FilteredHistoryPipe,
    SortedAndFilteredHistoryPipe,
  ],
  templateUrl: './tetris-game.component.html',
  styleUrl: './tetris-game.component.scss',
})
export class TetrisGameComponent implements OnInit {
  playerData: { name?: string; token?: string; colorPalette?: string } = {};
  highscores: { name: string; score: number }[] = [];
  // myScores: { name: string; score: number }[] = [];
  constructor(
    private _location: Location,
    private playerDataService: PlayerDataService,
    private highscoresService: HighscoresService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.playerDataService.currentData.subscribe((data) => {
      if (data) {
        this.playerData = {
          name: data.name,
          token: data.token,
          colorPalette: data.colorPalette,
        };
        // Use the data for the game setup
        console.log(data);
      }
    });
  }

  // gameFinished(score: number): void {
  //   const headers = new HttpHeaders().set('auth-token', this.playerData.token);

  //   this.http.post('/scores', { name: this.playerData.name, score }, { headers }).subscribe(
  //     (response) => {
  //       // handle successful submission
  //     },
  //     (error) => {
  //       // handle failed submission
  //     }
  //   );
  // }

  loadHighscores(): void {
    this.highscoresService.load().subscribe(
      (result: any) => {
        this.highscores = result as { name: string; score: number }[];
      },
      (error) => {
        console.log(error.error);
      }
    );
  }

  // loadMyScores(): void {
  //   if (this.playerData) {
  //     this.myScores = this.highscores.filter(score => score.name === this.playerData.name);
  //   }
  // }

  sortHighscoresAsc() {
    this.highscores.sort((a, b) => a.score - b.score);
  }

  sortHighscoresDesc() {
    this.highscores.sort((a, b) => b.score - a.score);
  }

  endGame() {
    this.start = false;
    this.gameEnded.emit();
    this.gameStatus = 'READY';
    clearInterval(this.timerId);
    this.isTimerRunning = false;
  }

  goBack() {
    this._location.back();
  }

  @Input() tileSize: any = '25px';
  @Input() initialSpeed: number = 500;
  @Input() start: boolean = false;
  @Input() stop: boolean = false;
  @Input() reset: boolean = false;
  @Input() moveLeft: boolean = false;
  @Input() moveRight: boolean = false;
  @Input() moveDown: boolean = false;
  @Input() drop: boolean = false;
  @Input() rotate: boolean = false;

  @Output() gameEnded = new EventEmitter<void>();
  @Output() lineCleared = new EventEmitter<void>();
  @Output() gameOver = new EventEmitter();

  clearedLinesCount: number = 0;
  gameStatus: string = 'READY';
  gameStartTime!: number;
  gameEndTime!: number;
  timePassed: number = 0;
  timerId: any;
  isTimerRunning: boolean = false;

  private clearHistoryMarker = { type: '', timestamp: -1 };
  private gameplayHistorySubject = new Subject<
    | { type: string; timestamp: number }
    | typeof TetrisGameComponent.prototype.clearHistoryMarker
  >();
  gameplayHistory$: Observable<{ type: string; timestamp: number }[]> =
    this.gameplayHistorySubject.pipe(
      scan(
        (history: { type: string; timestamp: number }[], event) =>
          event === this.clearHistoryMarker ? [] : [...history, event],
        []
      )
    );
  uniqueActionTypes$: Observable<string[]> = this.gameplayHistory$.pipe(
    map((events) => [...new Set(events.map((event) => event.type))])
  );
  sortOrder: 'asc' | 'desc' = 'asc';
  filterCriteria: string = '';

  getUniqueActionTypes(): Observable<string[]> {
    return this.uniqueActionTypes$;
  }

  getTimeSpent() {
    const minutes = Math.floor(this.timePassed / 60000);
    const seconds = ((this.timePassed % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds}`;
  }

  onLineCleared() {
    this.lineCleared.emit();
    this.clearedLinesCount++;
    this.addEventToHistory('LineCleared');
  }

  gameLost() {
    this.gameOver.emit();
    this.gameStatus = 'LOST';
    this.addEventToHistory('GameLost');
    clearInterval(this.timerId);
    this.isTimerRunning = false;
  }

  clearHistory() {
    this.gameplayHistorySubject.next(this.clearHistoryMarker);
  }

  addEventToHistory(type: string) {
    this.gameplayHistorySubject.next({ type, timestamp: Date.now() });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'a':
      case 'A':
        this.onLeftButtonPressed();
        break;
      case 'd':
      case 'D':
        this.onRightButtonPressed();
        break;
      case 's':
      case 'S':
        this.onDownButtonPressed();
        break;
      case ' ':
        this.onRotateButtonPressed();
        break;
      case 'w':
      case 'W':
        this.onDropButtonPressed();
        break;
    }
  }

  @ViewChild(TetrisCoreComponent)
  private _tetris!: TetrisCoreComponent;

  public onStartButtonPressed() {
    if (!this.isTimerRunning) {
      this._tetris.actionStart();
      this.gameStatus = 'PLAYING';
      this.gameStartTime = Date.now();
      this.addEventToHistory('GameStarted');
      this.timerId = setInterval(() => {
        this.timePassed += 1000;
      }, 1000);
      this.isTimerRunning = true;
    } else if (this.gameStatus === 'PAUSED') {
      this._tetris.actionStart();
      this.gameStatus = 'PLAYING';
    }
  }

  public onStopButtonPressed() {
    this._tetris.actionStop();
    this.gameStatus = 'PAUSED';
    this.addEventToHistory('GamePaused');
    clearInterval(this.timerId);
    this.isTimerRunning = false;
  }

  public onResetButtonPressed() {
    if (this.gameStatus === 'PLAYING') {
      this.onStopButtonPressed();
    }
    this._tetris.actionReset();
    this.gameStatus = 'READY';
    this.gameEndTime = Date.now();
    this.clearHistory();
    this.clearedLinesCount = 0;
    this.timePassed = 0;
    this.isTimerRunning = false;
  }

  public onLeftButtonPressed() {
    this._tetris.actionLeft();
  }

  public onDownButtonPressed() {
    this._tetris.actionDown();
  }
  public onRightButtonPressed() {
    this._tetris.actionRight();
  }

  public onRotateButtonPressed() {
    this._tetris.actionRotate();
  }

  public onDropButtonPressed() {
    this._tetris.actionDrop();
  }
}
