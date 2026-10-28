import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-generic-drag-drop',
  standalone: true,
  template: `
    <div
      class="border-2 border-dashed rounded-xl text-center transition-all cursor-pointer"
      [class]="(compact() ? 'px-3 py-2 ' : 'p-8 ') + (isDragOver() ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500')"
      role="button"
      tabindex="0"
      aria-label="Choose or drop a file"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
      (keydown.enter)="fileInput.click()"
      (keydown.space)="$event.preventDefault(); fileInput.click()"
    >
      <input
        #fileInput
        type="file"
        [multiple]="multiple()"
        [accept]="accept()"
        class="hidden"
        (change)="onFileSelect($event)"
      />
      <ng-content />
    </div>
  `,
})
export class GenericDragDropComponent {
  multiple = input<boolean>(false);
  compact = input<boolean>(false);
  accept = input<string>('');
  onFilesDropped = output<FileList>();

  isDragOver = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.onFilesDropped.emit(files);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.onFilesDropped.emit(input.files);
    }
    input.value = '';
  }
}
