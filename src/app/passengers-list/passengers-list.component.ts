import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // *** الخطوة 1: استيراد FormsModule ***

@Component({
  selector: 'app-passengers-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // *** الخطوة 2: إضافة FormsModule هنا ***
  templateUrl: './passengers-list.component.html',
})
export class PassengersListComponent implements OnInit {
  passengers: any[] = [];
  isLoading = true;
  paginationInfo: any = null;

  // --- المتغيرات الجديدة ---
  pageSize = 10; // القيمة الافتراضية لحجم الصفحة
  availablePageSizes = [10, 25, 50, 100]; // الخيارات المتاحة لحجم الصفحة
  goToPageNumber: number | null = null; // لتخزين رقم الصفحة الذي يدخله المستخدم

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadPassengers(1);
  }

  loadPassengers(page: number): void {
    this.isLoading = true;
    this.adminService.getAllPassengers(page, this.pageSize).subscribe({
      next: (response) => {
        this.passengers = response.data.items;
        this.paginationInfo = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('خطأ في جلب بيانات الركاب:', err);
        this.isLoading = false;
      }
    });
  }

  // --- الدوال الجديدة والمحدثة ---

  /**
   * يتم استدعاؤها عند تغيير حجم الصفحة من القائمة المنسدلة.
   * تعيد تحميل البيانات من الصفحة الأولى بالحجم الجديد.
   */
  onPageSizeChange(): void {
    this.loadPassengers(1); // ابدأ دائمًا من الصفحة 1 عند تغيير الحجم
  }

  /**
   * يتم استدعاؤها عند النقر على زر "اذهب" للانتقال إلى صفحة معينة.
   */
  goToPage(): void {
    if (this.goToPageNumber && this.paginationInfo && this.goToPageNumber > 0 && this.goToPageNumber <= this.paginationInfo.totalPages) {
      this.loadPassengers(this.goToPageNumber);
    }
  }

  nextPage(): void {
    if (!this.paginationInfo || !this.paginationInfo.hasNextPage) {
      return;
    }
    const nextPageNumber = this.paginationInfo.pageNumber + 1;
    this.loadPassengers(nextPageNumber);
  }

  prevPage(): void {
    if (!this.paginationInfo || !this.paginationInfo.hasPreviousPage) {
      return;
    }
    const prevPageNumber = this.paginationInfo.pageNumber - 1;
    this.loadPassengers(prevPageNumber);
  }
}
