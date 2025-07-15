import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { PassengerDashboardComponent } from './pages/passenger-dashboard/passenger-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyRidesComponent } from './pages/my-rides/my-rides.component';
import { TripDetailsComponent } from './pages/trip-details/trip-details.component';
import { CreateTripComponent } from './pages/create-trip/create-trip.component';
import { AuthComponent } from './pages/auth/auth.component';
// import { RegisterComponent } from './pages/register/register.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
    {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'passenger-dashboard', component: PassengerDashboardComponent },
      { path: 'my-rides', component: MyRidesComponent },
      { path: 'trip-details', component: TripDetailsComponent },
      { path: 'create-trip', component: CreateTripComponent },
      { path: 'profile', component: ProfileComponent },
    ]
  },
  { path: 'auth', component: AuthComponent },
  // { path: 'register', component: RegisterComponent }
];
