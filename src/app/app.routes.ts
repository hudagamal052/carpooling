import { Routes } from '@angular/router';
import { TripLauncherComponent } from './components/trip-launcher/trip-launcher.component';
import { VerifyDriverComponent } from './pages/verify-driver/verify-driver.component';
import { CreateTripComponent } from './pages/create-trip/create-trip.component';

export const routes: Routes = [
  {
    path: '',
    component: TripLauncherComponent,
    title: 'الصفحة الرئيسية - مشاركة الرحلات'
  },
  {
    path: 'verify-driver',
    component: VerifyDriverComponent,
    title: 'توثيق حساب السائق'
  },
  {
    path: 'create-trip',
    component: CreateTripComponent,
    title: 'إنشاء رحلة جديدة'
  },
  {
    path: 'dashboard',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
  }
];

