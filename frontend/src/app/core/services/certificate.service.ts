import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Certificate, CertificateVerification } from '../models';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  list(): Promise<Certificate[]> {
    return firstValueFrom(this.http.get<ApiResponse<Certificate[]>>(`${this.api}/certificates`))
      .then(response => response.data ?? []);
  }
  get(id: string): Promise<Certificate> {
    return firstValueFrom(this.http.get<ApiResponse<Certificate>>(`${this.api}/certificates/${id}`))
      .then(response => response.data);
  }
  verify(certificateId: string): Promise<CertificateVerification> {
    return firstValueFrom(this.http.get<ApiResponse<CertificateVerification>>(
      `${this.api}/certificates/verify/${encodeURIComponent(certificateId)}`
    )).then(response => response.data);
  }
  async download(certificate: Certificate): Promise<void> {
    const blob = await firstValueFrom(this.http.get(
      `${this.api}/certificates/${certificate.id}/download`, { responseType: 'blob' }
    ));
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${certificate.certificateId}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
