import { Component, forwardRef, HostListener, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
      [ngClass]="{
        'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragging(),
        'border-gray-300 dark:border-gray-600 hover:border-blue-400': !isDragging()
      }"
      (click)="fileInput.click()"
    >
      <input type="file" #fileInput class="hidden" (change)="onFileSelected($event)" accept=".pdf,.ppt,.pptx" />
      
      <div *ngIf="!selectedFile()" class="text-gray-500 dark:text-gray-400">
        <svg class="mx-auto h-12 w-12 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p class="text-sm font-medium">Drag & drop your file here, or click to browse</p>
        <p class="text-xs mt-1">Supports PDF, PPT, PPTX (Max 10MB)</p>
      </div>
      
      <div *ngIf="selectedFile()" class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center truncate">
          <svg class="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm font-medium truncate">{{ selectedFile()?.name }}</span>
        </div>
        <button type="button" class="text-gray-400 hover:text-red-500" (click)="clearFile($event)">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  isDragging = signal(false);
  selectedFile = signal<File | null>(null);

  onChange = (val: File | null) => {};
  onTouched = () => {};

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.handleFile(event.target.files[0]);
    }
  }

  handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Max size is 10MB.');
      return;
    }
    
    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'ppt', 'pptx'].includes(ext || '')) {
      alert('Invalid file format. Only PDF, PPT, and PPTX are allowed.');
      return;
    }
    
    this.selectedFile.set(file);
    this.onChange(file);
    this.onTouched();
  }

  clearFile(event: Event) {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.onChange(null);
    this.onTouched();
  }

  writeValue(val: File | null): void {
    this.selectedFile.set(val);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
