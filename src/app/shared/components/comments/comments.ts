import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

import {
  BaseComponent
} from '../../../core/base/base.component';

import {
  CommentAttachment,
  CreateCommentPayload,
  EntityComment,
  UpdateCommentPayload
} from './comments.models';

interface CommentDateGroup {
  key: string;
  label: string;
  comments: EntityComment[];
}

@Component({
  selector: 'to-comments',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    ButtonModule,
    TextareaModule
  ],
  templateUrl: './comments.html',
  styleUrl: './comments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsComponent extends BaseComponent {
  readonly comments = input<EntityComment[]>([]);
  readonly isloading = input(false);
  readonly submitting = input(false);
  readonly readOnly = input(false);

  readonly currentUserId =
    input<number | string | null>(null);

  readonly allowAttachments = input(true);
  readonly maxFileSizeBytes = input(10 * 1024 * 1024);
  readonly acceptedFileTypes = input(
    'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip'
  );

  readonly commentAdded =
    output<CreateCommentPayload>();

  readonly commentUpdated =
    output<UpdateCommentPayload>();

  readonly commentRemoved =
    output<number | string>();

  readonly attachmentSelected =
    output<CommentAttachment>();

  readonly draftMessage = signal('');
  readonly selectedFiles = signal<File[]>([]);

  readonly editingCommentId =
    signal<number | string | null>(null);

  readonly editingMessage = signal('');

  readonly deletingCommentId =
    signal<number | string | null>(null);

  readonly composerOpen = signal(false);
  readonly validationMessage =
    signal<string | null>(null);

  readonly commentCount = computed(
    () => this.comments().length
  );

  readonly canSubmit = computed(() => {
    return (
      this.draftMessage().trim().length > 0 &&
      !this.submitting()
    );
  });

  readonly groupedComments =
    computed<CommentDateGroup[]>(() => {
      const sortedComments = [
        ...this.comments()
      ].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      );

      const groups = new Map<string, EntityComment[]>();

      for (const comment of sortedComments) {
        const date = new Date(comment.createdAt);
        const key = this.dateKey(date);

        const currentGroup = groups.get(key) ?? [];
        currentGroup.push(comment);
        groups.set(key, currentGroup);
      }

      return Array.from(groups.entries()).map(
        ([key, comments]) => ({
          key,
          label: this.dateLabel(
            new Date(comments[0].createdAt)
          ),
          comments
        })
      );
    });

  openComposer(): void {
    if (this.readOnly()) {
      return;
    }

    this.composerOpen.set(true);
    this.validationMessage.set(null);
  }

  closeComposer(): void {
    if (this.submitting()) {
      return;
    }

    this.composerOpen.set(false);
    this.resetComposer();
  }

  submitComment(): void {
    const message = this.draftMessage().trim();

    if (!message) {
      this.validationMessage.set(
        'Enter a comment before submitting.'
      );
      return;
    }

    this.validationMessage.set(null);

    this.commentAdded.emit({
      message,
      files: this.selectedFiles()
    });
  }

  onFilesSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of files) {
      if (file.size > this.maxFileSizeBytes()) {
        invalidFiles.push(file.name);
        continue;
      }

      validFiles.push(file);
    }

    if (invalidFiles.length) {
      this.validationMessage.set(
        `These files exceed the allowed size: ${invalidFiles.join(', ')}`
      );
    } else {
      this.validationMessage.set(null);
    }

    this.selectedFiles.update(currentFiles => {
      const existingKeys = new Set(
        currentFiles.map(file =>
          this.fileKey(file)
        )
      );

      const newFiles = validFiles.filter(
        file => !existingKeys.has(this.fileKey(file))
      );

      return [
        ...currentFiles,
        ...newFiles
      ];
    });

    input.value = '';
  }

  removeSelectedFile(file: File): void {
    this.selectedFiles.update(files =>
      files.filter(
        currentFile =>
          this.fileKey(currentFile) !==
          this.fileKey(file)
      )
    );
  }

  startEdit(comment: EntityComment): void {
    if (!this.canManageComment(comment)) {
      return;
    }

    this.editingCommentId.set(comment.id);
    this.editingMessage.set(comment.message);
  }

  cancelEdit(): void {
    this.editingCommentId.set(null);
    this.editingMessage.set('');
  }

  saveEdit(comment: EntityComment): void {
    const message = this.editingMessage().trim();

    if (!message) {
      return;
    }

    this.commentUpdated.emit({
      commentId: comment.id,
      message
    });
  }

  requestDelete(comment: EntityComment): void {
    if (!this.canManageComment(comment)) {
      return;
    }

    this.deletingCommentId.set(comment.id);
  }

  cancelDelete(): void {
    this.deletingCommentId.set(null);
  }

  confirmDelete(comment: EntityComment): void {
    this.commentRemoved.emit(comment.id);
    this.deletingCommentId.set(null);
  }

  openAttachment(
    attachment: CommentAttachment
  ): void {
    this.attachmentSelected.emit(attachment);

    if (attachment.downloadUrl) {
      window.open(
        attachment.downloadUrl,
        '_blank',
        'noopener,noreferrer'
      );
    }
  }

  canManageComment(
    comment: EntityComment
  ): boolean {
    const currentUserId = this.currentUserId();

    return (
      !this.readOnly() &&
      currentUserId !== null &&
      String(comment.createdById) ===
        String(currentUserId)
    );
  }

  initials(name: string): string {
    const normalizedName = name.trim();

    if (!normalizedName) {
      return 'U';
    }

    return normalizedName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  }

  fileIcon(
    fileNameOrType: string
  ): string {
    const value = fileNameOrType.toLowerCase();

    if (
      value.includes('image') ||
      /\.(png|jpg|jpeg|gif|webp|svg)$/.test(value)
    ) {
      return 'pi pi-image';
    }

    if (
      value.includes('pdf') ||
      value.endsWith('.pdf')
    ) {
      return 'pi pi-file-pdf';
    }

    if (
      value.includes('spreadsheet') ||
      /\.(xls|xlsx|csv)$/.test(value)
    ) {
      return 'pi pi-file-excel';
    }

    if (
      value.includes('word') ||
      /\.(doc|docx)$/.test(value)
    ) {
      return 'pi pi-file-word';
    }

    if (
      value.includes('zip') ||
      /\.(zip|rar|7z)$/.test(value)
    ) {
      return 'pi pi-folder';
    }

    return 'pi pi-file';
  }

  formatFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return '0 B';
    }

    const units = [
      'B',
      'KB',
      'MB',
      'GB'
    ];

    const unitIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    const value =
      bytes / Math.pow(1024, unitIndex);

    return `${value.toFixed(
      unitIndex === 0 ? 0 : 1
    )} ${units[unitIndex]}`;
  }

  resetAfterSuccessfulSubmit(): void {
    this.composerOpen.set(false);
    this.resetComposer();
  }

  finishEdit(): void {
    this.cancelEdit();
  }

  private resetComposer(): void {
    this.draftMessage.set('');
    this.selectedFiles.set([]);
    this.validationMessage.set(null);
  }

  private fileKey(file: File): string {
    return [
      file.name,
      file.size,
      file.lastModified
    ].join(':');
  }

  private dateKey(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  private dateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (this.isSameDate(date, today)) {
      return 'Today';
    }

    if (this.isSameDate(date, yesterday)) {
      return 'Yesterday';
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      }
    ).format(date);
  }

  private isSameDate(
    first: Date,
    second: Date
  ): boolean {
    return (
      first.getFullYear() ===
        second.getFullYear() &&
      first.getMonth() ===
        second.getMonth() &&
      first.getDate() ===
        second.getDate()
    );
  }
}