import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PlayerDataService } from './player-data.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerDataGuardService implements CanActivate {
  constructor(
    private playerDataService: PlayerDataService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.playerDataService.hasPlayerData()) {
      // Player data is not empty, allow navigation
      return true;
    } else {
      // Player data is empty, redirect to intro page
      return this.router.createUrlTree(['/intro']);
    }
  }
}
