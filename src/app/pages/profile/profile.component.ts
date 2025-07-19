import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Subscription } from 'rxjs';
import { DatePipe, NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [DatePipe, NgClass, CommonModule,FormsModule],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = null;
  isDriver: boolean = false;
  driverProfile: any = null;
  driverTrips: any[] = [];
  driverDocuments: any[] = [];
  driverVehicle: any = null;
  passengerProfile: any = null;
  passengerTrips = [
    { destination: 'أسيوط', date: '2024-06-05' },
    { destination: 'سوهاج', date: '2024-06-12' }
  ];
  private subscriptions: Subscription[] = [];

  // متغيرات التعديل
  editMode = false;
  editPassengerData = { Name: '', PhoneNumber: '', ProfileImage: null as File | null };
  editDriverData = { driverName: '', phoneNumber: '', description: '', profileImage: undefined as File | undefined };
  isSaving = false;

  constructor(private authService: AuthService, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.getCurrentUserObservable().subscribe(user => {
        this.user = user;
      })
    );
    this.subscriptions.push(
      this.authService.getIsVerifiedDriverObservable().subscribe(isDriver => {
        this.isDriver = isDriver;
        if (isDriver) {
          this.fetchDriverProfile();
          this.fetchDriverTrips();
          this.fetchDriverDocuments();
          this.fetchDriverVehicle();
        } else {
          this.fetchPassengerProfile();
        }
      })
    );
  }

  // --- تعديل بيانات الراكب ---
  openEditPassenger() {
    this.editMode = true;
    this.editPassengerData.Name = this.passengerProfile?.name || '';
    this.editPassengerData.PhoneNumber = this.passengerProfile?.phoneNumber || '';
    this.editPassengerData.ProfileImage = null;
  }
  onPassengerImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editPassengerData.ProfileImage = file;
      // عرض الصورة المختارة مباشرة
      if (this.passengerProfile) {
        this.passengerProfile.profileImageUrl = URL.createObjectURL(file);
      }
    }
  }
  savePassengerProfile() {
    this.isSaving = true;
    const dataToSend: { Name: string; PhoneNumber: string; ProfileImage?: File } = {
      Name: this.editPassengerData.Name,
      PhoneNumber: this.editPassengerData.PhoneNumber
    };
    if (this.editPassengerData.ProfileImage) {
      dataToSend.ProfileImage = this.editPassengerData.ProfileImage;
    }
    this.profileService.updatePassengerProfile(dataToSend).subscribe({
      next: () => {
        this.isSaving = false;
        this.editMode = false;
        // إذا كان هناك صورة مختارة، أبقها معروضة مؤقتًا
        if (this.editPassengerData.ProfileImage && this.passengerProfile) {
          this.passengerProfile.profileImageUrl = URL.createObjectURL(this.editPassengerData.ProfileImage);
        }
        // ثم جلب البيانات من الـAPI بعد ثانيتين (لإعطاء السيرفر وقتًا لمعالجة الصورة)
        setTimeout(() => this.fetchPassengerProfile(), 2000);
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }
  cancelEdit() {
    this.editMode = false;
  }

  // --- تعديل بيانات السائق ---
  openEditDriver() {
    this.editMode = true;
    this.editDriverData.driverName = this.driverProfile?.name || '';
    this.editDriverData.phoneNumber = this.driverProfile?.phoneNumber || '';
    this.editDriverData.description = this.driverProfile?.description || '';
    this.editDriverData.profileImage = undefined;
  }
  onDriverImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editDriverData.profileImage = file;
      if (this.driverProfile) {
        this.driverProfile.profileImageUrl = URL.createObjectURL(file);
      }
    }
  }
  saveDriverProfile() {
    this.isSaving = true;
    this.profileService.editDriverProfile(this.editDriverData).subscribe({
      next: () => {
        this.isSaving = false;
        this.editMode = false;
        this.fetchDriverProfile();
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  fetchDriverProfile() {
    this.profileService.getDriverProfile().subscribe(res => {
      this.driverProfile = res.data;
    });
  }

  fetchDriverTrips() {
    this.profileService.getDriverTrips().subscribe(res => {
      this.driverTrips = res.data;
    });
  }

  fetchDriverDocuments() {
    this.profileService.getDriverVerificationDocuments().subscribe(res => {
      this.driverDocuments = res.data;
    });
  }

  fetchDriverVehicle() {
    this.profileService.getDriverVehicleDetails().subscribe(res => {
      this.driverVehicle = res.data;
    });
  }

  fetchPassengerProfile() {
    this.profileService.getPassengerProfile().subscribe(res => {
      this.passengerProfile = res.data;
      // إذا كان هناك صورة، أضف كود زمني لإجبار التحديث
      if (this.passengerProfile && this.passengerProfile.profileImageUrl && this.passengerProfile.profileImageUrl.trim() !== '') {
        this.passengerProfile.profileImageUrl += '?t=' + new Date().getTime();
      } else {
        // fallback لصورة افتراضية
        this.passengerProfile.profileImageUrl = 'https://i.pravatar.cc/100';
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}