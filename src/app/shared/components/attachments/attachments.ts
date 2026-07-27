import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';

import { DatePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import {
  AttachmentItem,
  AttachmentKind,
  AttachmentOpenEvent,
  AttachmentRemoveEvent,
  AttachmentUploadEvent
} from './attachments.models';

@Component({
  selector: 'to-attachments',
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule
  ],
  templateUrl: './attachments.html',
  styleUrl: './attachments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachmentsComponent {
  readonly attachments =
    input<AttachmentItem[]>([]);

  readonly loading = input(false);

  readonly uploading = input(false);

  readonly readOnly = input(false);

  readonly allowUpload = input(true);

  readonly allowMultiple = input(true);

  readonly accept = input(
    'image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.7z,.mp4,.mov,.mp3,.wav'
  );

  readonly maxFileSizeBytes =
    input(15 * 1024 * 1024);

  readonly emptyTitle =
    input('No attachments');

  readonly emptyMessage =
    input('Files uploaded for this record will appear here.');

  readonly dataTestId =
    input('attachments');

  readonly filesSelected =
    output<AttachmentUploadEvent>();

  readonly attachmentOpened =
    output<AttachmentOpenEvent>();

  readonly attachmentRemoved =
    output<AttachmentRemoveEvent>();

  readonly validationMessage =
    signal<string | null>(null);

  readonly attachmentCount = computed(
    () => this.attachments().length
  );

  readonly hasAttachments = computed(
    () => this.attachmentCount() > 0
  );

  onFilesSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const files =
      Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    const validFiles: File[] = [];
    const rejectedFiles: string[] = [];

    for (const file of files) {
      if (file.size > this.maxFileSizeBytes()) {
        rejectedFiles.push(file.name);
        continue;
      }

      validFiles.push(file);
    }

    if (rejectedFiles.length) {
      this.validationMessage.set(
        `These files exceed the maximum size: ${rejectedFiles.join(', ')}`
      );
    } else {
      this.validationMessage.set(null);
    }

    if (validFiles.length) {
      this.filesSelected.emit({
        files: validFiles
      });
    }

    input.value = '';
  }

  openAttachment(
    attachment: AttachmentItem
  ): void {
    this.attachmentOpened.emit({
      attachment
    });
  }

  removeAttachment(
    attachment: AttachmentItem
  ): void {
    if (
      this.readOnly() ||
      attachment.removable !== true ||
      attachment.deleting === true
    ) {
      return;
    }

    this.attachmentRemoved.emit({
      attachment
    });
  }

  attachmentKind(
    attachment: AttachmentItem
  ): AttachmentKind {
    if (attachment.kind) {
      return attachment.kind;
    }

    const value = [
      attachment.fileType ?? '',
      attachment.fileName
    ]
      .join(' ')
      .toLowerCase();

    if (
      value.includes('image') ||
      /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(value)
    ) {
      return 'IMAGE';
    }

    if (
      value.includes('pdf') ||
      /\.pdf$/i.test(value)
    ) {
      return 'PDF';
    }

    if (
      value.includes('spreadsheet') ||
      /\.(xls|xlsx|csv)$/i.test(value)
    ) {
      return 'SPREADSHEET';
    }

    if (
      value.includes('word') ||
      /\.(doc|docx|txt)$/i.test(value)
    ) {
      return 'DOCUMENT';
    }

    if (
      /\.(zip|rar|7z)$/i.test(value)
    ) {
      return 'ARCHIVE';
    }

    if (
      value.includes('video') ||
      /\.(mp4|mov|avi|mkv|webm)$/i.test(value)
    ) {
      return 'VIDEO';
    }

    if (
      value.includes('audio') ||
      /\.(mp3|wav|ogg|m4a)$/i.test(value)
    ) {
      return 'AUDIO';
    }

    return 'OTHER';
  }

  icon(
    attachment: AttachmentItem
  ): string {
    switch (this.attachmentKind(attachment)) {
      case 'IMAGE':
        return 'pi pi-image';

      case 'PDF':
        return 'pi pi-file-pdf';

      case 'DOCUMENT':
        return 'pi pi-file-word';

      case 'SPREADSHEET':
        return 'pi pi-file-excel';

      case 'ARCHIVE':
        return 'pi pi-folder';

      case 'VIDEO':
        return 'pi pi-video';

      case 'AUDIO':
        return 'pi pi-volume-up';

      default:
        return 'pi pi-file';
    }
  }

  formatFileSize(
    bytes?: number | null
  ): string {
    if (
      bytes === null ||
      bytes === undefined ||
      !Number.isFinite(bytes) ||
      bytes <= 0
    ) {
      return 'Unknown size';
    }

    const units = [
      'B',
      'KB',
      'MB',
      'GB'
    ];

    const unitIndex = Math.min(
      Math.floor(
        Math.log(bytes) /
        Math.log(1024)
      ),
      units.length - 1
    );

    const value =
      bytes /
      Math.pow(1024, unitIndex);

    return `${value.toFixed(
      unitIndex === 0 ? 0 : 1
    )} ${units[unitIndex]}`;
  }

  canPreview(
    attachment: AttachmentItem
  ): boolean {
    return (
      Boolean(attachment.previewUrl) ||
      Boolean(attachment.downloadUrl)
    );
  }
}