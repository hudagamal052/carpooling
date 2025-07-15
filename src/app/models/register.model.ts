export interface RegisterData {
  Name: string;
  Email: string;
  Password: string;
  ConfirmPassword?: string; // غالباً غير مطلوب في الـ backend
  PhoneNumber: string;
  Gender: number;
}