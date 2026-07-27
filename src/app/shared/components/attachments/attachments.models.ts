export type AttachmentKind =
  | 'IMAGE'
  | 'PDF'
  | 'DOCUMENT'
  | 'SPREADSHEET'
  | 'ARCHIVE'
  | 'VIDEO'
  | 'AUDIO'
  | 'OTHER';

export interface AttachmentItem {
  id: number | string;

  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;

  kind?: AttachmentKind;

  previewUrl?: string | null;
  downloadUrl?: string | null;

  uploadedBy?: string | null;
  uploadedAt?: string | null;

  removable?: boolean;
  downloading?: boolean;
  deleting?: boolean;

  dataTestId?: string;
}

export interface AttachmentUploadEvent {
  files: File[];
}

export interface AttachmentRemoveEvent {
  attachment: AttachmentItem;
}

export interface AttachmentOpenEvent {
  attachment: AttachmentItem;
}