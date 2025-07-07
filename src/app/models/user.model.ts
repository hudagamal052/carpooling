export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerifiedDriver: boolean;
  driverLicense?: string;
  vehicleInfo?: VehicleInfo;
  createdAt: Date;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  capacity: number;
}

export interface DriverVerificationData {
  licenseNumber: string;
  licenseImage: File | null;
  vehicleInfo: VehicleInfo;
  additionalDocuments?: File[];
}

