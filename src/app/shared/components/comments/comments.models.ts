export interface CommentAttachment {
  id: number | string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl?: string | null;
}

export interface EntityComment {
  id: number | string;

  message: string;

  createdAt: string;
  updatedAt?: string | null;

  createdById: number | string;
  createdByName: string;
  createdByAvatar?: string | null;

  edited?: boolean;

  attachments?: CommentAttachment[];
  mentions?: string[];
}

export interface CreateCommentPayload {
  message: string;
  files: File[];
}

export interface UpdateCommentPayload {
  commentId: number | string;
  message: string;
}