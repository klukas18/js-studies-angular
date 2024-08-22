import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormsModule,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { PlayerDataService } from '../player-data.service';
import { Router } from '@angular/router';
import { TokenAuthService } from '../token-auth.service';

@Component({
  selector: 'app-intro-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './intro-page.component.html',
  styleUrl: './intro-page.component.scss',
})
export class IntroPageComponent implements OnInit {
  constructor(
    private playerDataService: PlayerDataService,
    private tokenAuthService: TokenAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.visitIntroPage();
  }

  visitIntroPage(): void {
    console.log('visitIntroPage');
    this.playerDataService.clearPlayerData();
  }

  fb = inject(FormBuilder);
  playerName: string = '';
  studentID: string = '';
  selectedColor: string = 'normal';

  playerForm: FormGroup = this.fb.group({
    playerName: ['', [Validators.required, Validators.minLength(5)]],
    studentID: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    selectedColor: ['normal'],
  });

  isPlayerNameInvalid(): boolean {
    const control = this.playerForm.get('playerName');
    return !!control && control.touched && control.invalid;
  }

  isStudentIDInvalid(): boolean {
    const control = this.playerForm.get('studentID');
    return !!control && control.touched && control.invalid;
  }

  public get userName() {
    return this.playerForm.get('playerName') as FormControl;
  }

  public get userToken() {
    return this.playerForm.controls['studentID'];
  }

  setPlayerData(): void {
    const studentIDString: string = this.playerForm.value.studentID!.toString();
    this.tokenAuthService.auth(studentIDString).subscribe((data) => {
      if (data.success) {
        this.playerDataService.verifyUser();
        this.playerDataService.setPlayerData(
          this.playerForm.value.playerName!,
          this.playerForm.value.studentID!
        );

        const selectedColor = this.playerForm.value.selectedColor;
        localStorage.setItem('selectedColor', selectedColor);
        this.router.navigate(['/game', selectedColor]);
      } else {
        alert('Invalid ID');
        this.playerForm.patchValue({ playerName: '', studentID: '' });
      }
    });
  }
}
