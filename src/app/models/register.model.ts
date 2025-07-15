export interface RegisterData {
  Name: string;
  Email: string;
  Password: string;
  ConfirmPassword?: string; // غالباً غير مطلوب في الـ backend
  PhoneNumber: string;
  Gender: number;
}

export interface RegisterDriverRequest {
  ApplicationUserId: string;
  DriverDescription: string;
  VehicleDetailsCommand: {
    DriverId: string;
    Model: string;
    Color: string;
    PlateNumber: string;
    SeatsNumber: number;
    Description: string;
  };
  // Optionally, you can add file fields if needed for type safety
  // DriverLicense?: File;
  // Identity?: File;
  // VehicleRegistration?: File[];
}

export interface BooleanResponse {
  data: boolean;
  message?: string;
  internalMessage?: string;
  status?: number;
}

export interface StringResponse {
  data: string;
  message?: string;
  internalMessage?: string;
  status?: number;
}