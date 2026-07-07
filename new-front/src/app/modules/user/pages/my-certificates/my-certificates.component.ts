import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateService } from '../../../../services/certificate.service';
import { Certificate } from '../../../../models/certificate';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-certificates.component.html',
  styleUrls: ['./my-certificates.component.css']
})
export class MyCertificatesComponent implements OnInit {

  certificates: Certificate[] = [];
  loading = false;
  downloading: number | null = null;
  error = '';

  constructor(private certificateService: CertificateService) {}

  ngOnInit(): void {
    this.loading = true;
    this.certificateService.getMyCertificates().subscribe({
      next: (data) => { this.certificates = data; this.loading = false; },
      error: () => { this.error = 'Impossible de charger vos certificats.'; this.loading = false; }
    });
  }

  download(cert: Certificate): void {
    this.downloading = cert.id;
    this.certificateService.downloadCertificate(cert.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificat-${cert.eventTitle.replace(/\s+/g, '-')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloading = null;
      },
      error: () => { this.downloading = null; }
    });
  }

  copyVerifyLink(token: string): void {
    const url = `${window.location.origin}/verify/${token}`;
    navigator.clipboard.writeText(url);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-TN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}