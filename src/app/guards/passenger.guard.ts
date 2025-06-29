import { CanActivateFn } from '@angular/router';

export const passengerGuard: CanActivateFn = (route, state) => {
  return true;
};
