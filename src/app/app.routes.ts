import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { PassengerDashboardComponent } from './pages/passenger-dashboard/passenger-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyRidesComponent } from './pages/my-rides/my-rides.component';
export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'passenger-dashboard', component: PassengerDashboardComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'my-rides', component: MyRidesComponent }
];
