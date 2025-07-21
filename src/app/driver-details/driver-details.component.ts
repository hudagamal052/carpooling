import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-driver-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './driver-details.component.html',
  styleUrls: ['./driver-details.component.css']
})
export class DriverDetailsComponent implements OnInit {
  // سيحتوي هذا الآن على الكائن data مباشرة
  driverDetails$: Observable<any> | undefined;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.driverDetails$ = this.route.paramMap.pipe(
      switchMap(params => {
        const driverId = params.get('id');
        if (driverId) {
          this.isLoading = true;
          this.error = null;
          return this.adminService.getDriverDetailsById(driverId).pipe(
            // *** التعديل الرئيسي هنا ***
            // نستخدم map لاستخراج الكائن data من الاستجابة
            map(response => {
              this.isLoading = false;
              return response.data; // نمرر الكائن data إلى القالب
            }),
            catchError(err => {
              console.error("خطأ في جلب تفاصيل السائق:", err);
              this.error = "حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.";
              this.isLoading = false;
              return of(null); // إرجاع null في حالة الخطأ
            })
          );
        }
        this.error = "لم يتم العثور على هوية السائق.";
        this.isLoading = false;
        return of(null);
      })
    );
  }

  // دالة لتوثيق السائق
  verifyDriver(driverId: string): void {
    if (!confirm("هل أنت متأكد من أنك تريد توثيق هذا السائق؟")) return;

    this.adminService.verifyDriverById(driverId).subscribe({
      next: () => {
        alert("تم توثيق السائق بنجاح!");
        this.ngOnInit(); // إعادة تحميل البيانات لتحديث الواجهة
      },
      error: (err) => {
        alert("فشل توثيق السائق. يرجى مراجعة الكونسول.");
        console.error(err);
      }
    });
  }

  // دالة لتوثيق مستند معين
  verifyDocument(documentId: string): void {
    if (!confirm("هل أنت متأكد من أنك تريد توثيق هذا المستند؟")) return;

    this.adminService.verifyDocumentById(documentId).subscribe({
      next: () => {
        alert("تم توثيق المستند بنجاح!");
        this.ngOnInit(); // إعادة تحميل البيانات
      },
      error: (err) => {
        alert("فشل توثيق المستند.");
        console.error(err);
      }
    });
  }
}
