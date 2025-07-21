import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service'; // تأكد من أن المسار صحيح
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-passengers-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './passengers-list.component.html',
})
export class PassengersListComponent implements OnInit {
  passengers: any[] = [];
  isLoading = true;
  paginationInfo: any = null;
  pageSize = 10;

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

  nextPage(): void {
    // *** إضافة تحقق إضافي داخل الدالة نفسها ***
    if (!this.paginationInfo || !this.paginationInfo.hasNextPage) {
      return; // لا تفعل شيئًا إذا لم تكن هناك صفحة تالية
    }
    const nextPageNumber = this.paginationInfo.pageNumber + 1;
    this.loadPassengers(nextPageNumber);
  }

  prevPage(): void {
    // *** إضافة تحقق إضافي داخل الدالة نفسها ***
    if (!this.paginationInfo || !this.paginationInfo.hasPreviousPage) {
      return; // لا تفعل شيئًا إذا لم تكن هناك صفحة سابقة
    }
    const prevPageNumber = this.paginationInfo.pageNumber - 1;
    this.loadPassengers(prevPageNumber);
  }
}
