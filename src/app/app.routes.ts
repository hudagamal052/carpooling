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
import { SuggestedTripsComponent } from './pages/suggested-trips/suggested-trips.component';
import { SuggestTripComponent } from './pages/suggest-trip/suggest-trip.component';
import { MySuggestedTripsComponent } from './pages/my-suggested-trips/my-suggested-trips.component';

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
      { path: 'verify-driver', loadComponent: () => import('./pages/verify-driver/verify-driver.component').then(m => m.VerifyDriverComponent) },
      { path: 'suggested-trips', component: SuggestedTripsComponent },
      { path: 'suggest-trip', component: SuggestTripComponent},
      { path: 'suggest-trip/:id', component: SuggestTripComponent },
      { path: 'my-suggested-trips', component: MySuggestedTripsComponent },
      
    ]
  },
  { path: 'auth', component: AuthComponent },
  // { path: 'register', component: RegisterComponent }
];
