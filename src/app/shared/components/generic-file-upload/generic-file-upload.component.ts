import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GenericButtonComponent } from '../generic-button/generic-button.component';

@Component({
  selector: 'app-generic-file-upload',
  standalone: true,
  imports: [FormsModule, GenericButtonComponent],
  template: `
    <div class="space-y-4">
      <div
        class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
        [class]="isDragOver() ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'"
        (dragover)="onDragOver($event)"
        (dragleave)="isDragOver.set(false)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          [multiple]="multiple()"
          [accept]="accept()"
          class="hidden"
          (change)="onFileSelect($event)"
        />
        <svg class="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          <span class="text-blue-600 dark:text-blue-400 font-medium">Click to upload</span> or drag and drop
        </p>
        <p class="text-gray-400 text-xs mt-1">{{ accept() || 'All files' }}</p>
      </div>

      @if (files().length > 0) {
        <div class="space-y-2">
          @for (file of files(); track file.name) {
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatSize(file.size) }}</p>
                </div>
              </div>
              <button (click)="removeFile(file); $event.stopPropagation()" class="text-gray-400 hover:text-red-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
        </div>
        <app-generic-button (onClick)="uploadFiles()" [loading]="uploading()">
          Upload {{ files().length }} file(s)
        </app-generic-button>
      }
    </div>
  `,
})
export class GenericFileUploadComponent {
  multiple = input<boolean>(false);
  accept = input<string>('');
  onUpload = output<File[]>();

  files = signal<File[]>([]);
  isDragOver = signal(false);
  uploading = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      this.addFiles(droppedFiles);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
  }

  addFiles(fileList: FileList): void {
    const newFiles = Array.from(fileList);
    if (this.multiple()) {
      this.files.update((f) => [...f, ...newFiles]);
    } else {
      this.files.set(newFiles.slice(0, 1));
    }
  }

  removeFile(file: File): void {
    this.files.update((f) => f.filter((f) => f !== file));
  }

  uploadFiles(): void {
    this.uploading.set(true);
    this.onUpload.emit(this.files());
    setTimeout(() => this.uploading.set(false), 1000);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
