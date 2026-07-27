import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';

import {
  DatePipe,
  TitleCasePipe
} from '@angular/common';

import {
  finalize,
  forkJoin
} from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import {
  BaseComponent
} from '../../../../../core/base/base.component';

import {
  Priority,
  Severity,
  TicketStatus
} from '../../../../../core/models/application.enums';

import {
  AuthService
} from '../../../../../core/auth/auth.service';

import {
  CommentsComponent
} from '../../../../../shared/components/comments/comments';

import {
  CommentAttachment,
  CreateCommentPayload,
  EntityComment,
  UpdateCommentPayload
} from '../../../../../shared/components/comments/comments.models';

import {
  TicketTimelineComponent
} from '../../components/ticket-timeline/ticket-timeline';

import {
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketSla,
  TicketTimelineItem
} from '../../models/ticket.models';

import {
  TicketService
} from '../../services/ticket.service';

@Component({
  selector: 'to-ticket-detail',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    ButtonModule,
    TagModule,
    TicketTimelineComponent,
    CommentsComponent
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketDetailComponent
  extends BaseComponent {

  private readonly ticketService =
    inject(TicketService);

  private readonly authService =
    inject(AuthService);

  private readonly commentsComponent =
    viewChild(CommentsComponent);

  readonly ticketId =
    signal<number | null>(null);

  readonly ticket =
    signal<Ticket | null>(null);

  readonly timeline =
    signal<TicketTimelineItem[]>([]);

  readonly comments =
    signal<EntityComment[]>([]);

  readonly attachments =
    signal<TicketAttachment[]>([]);

  readonly sla =
    signal<TicketSla | null>(null);

  readonly loadingTimeline = signal(false);
  readonly loadingComments = signal(false);
  readonly submittingComment = signal(false);
  readonly actionLoading = signal(false);
  readonly uploadingAttachment = signal(false);

  readonly currentUserId = computed(
    () =>
      this.authService.currentUser()?.userId ??
      null
  );

  readonly canEdit = computed(() => {
    const status = this.ticket()?.status;

    return (
      status !== 'CLOSED' &&
      status !== 'CANCELLED' &&
      status !== 'REJECTED'
    );
  });

  readonly canCreateWorkOrder = computed(() => {
    const ticket = this.ticket();

    return Boolean(
      ticket &&
      !ticket.workOrderId &&
      ticket.status !== 'CLOSED' &&
      ticket.status !== 'CANCELLED' &&
      ticket.status !== 'REJECTED'
    );
  });

  readonly canAcknowledge = computed(
    () => this.ticket()?.status === 'OPEN'
  );

  readonly canStart = computed(() => {
    const status = this.ticket()?.status;

    return (
      status === 'ASSIGNED' ||
      status === 'ACKNOWLEDGED'
    );
  });

  readonly canResolve = computed(
    () => this.ticket()?.status === 'IN_PROGRESS'
  );

  readonly canConfirm = computed(
    () => this.ticket()?.status === 'RESOLVED'
  );

  readonly canClose = computed(() => {
    const status = this.ticket()?.status;

    return (
      status === 'CONFIRMED' ||
      status === 'VERIFIED'
    );
  });

  readonly responseSlaClass = computed(() =>
    this.slaClass(
      this.sla()?.responseRemainingMinutes,
      this.sla()?.responseBreached
    )
  );

  readonly resolutionSlaClass = computed(() =>
    this.slaClass(
      this.sla()?.resolutionRemainingMinutes,
      this.sla()?.resolutionBreached
    )
  );

  constructor() {
    super();

    this.activatedRoute.paramMap
      .pipe(this.untilDestroyed())
      .subscribe(params => {
        const ticketId = Number(
          params.get('ticketId')
        );

        if (
          !Number.isInteger(ticketId) ||
          ticketId <= 0
        ) {
          void this.navigateByUrl(
            '/tenant/tickets'
          );

          return;
        }

        this.ticketId.set(ticketId);
        this.loadTicket();
      });
  }

  refresh(): void {
    this.loadTicket();
  }

  goBack(): void {
    void this.navigateByUrl(
      '/tenant/tickets'
    );
  }

  editTicket(): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    void this.navigate(
      ['/tenant/tickets'],
      {
        queryParams: {
          mode: 'edit',
          ticketId
        }
      }
    );
  }

  openSite(): void {
    const siteId = this.ticket()?.siteId;

    if (!siteId) {
      return;
    }

    void this.navigateByUrl(
      `/tenant/sites/${siteId}`
    );
  }

  openDevice(): void {
    const deviceId = this.ticket()?.deviceId;

    if (!deviceId) {
      return;
    }

    void this.navigateByUrl(
      `/tenant/devices/${deviceId}`
    );
  }

  openAlert(): void {
    const alertId = this.ticket()?.alertId;

    if (!alertId) {
      return;
    }

    void this.navigate(
      ['/tenant/alerts'],
      {
        queryParams: {
          alertId
        }
      }
    );
  }

  openWorkOrder(): void {
    const workOrderId =
      this.ticket()?.workOrderId;

    if (!workOrderId) {
      return;
    }

    void this.navigateByUrl(
      `/tenant/work-orders/${workOrderId}`
    );
  }

  acknowledge(): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    this.executeTicketAction(
      this.ticketService.updateStatus(
        ticketId,
        {
          status: 'ACKNOWLEDGED'
        }
      ),
      'Ticket acknowledged successfully.'
    );
  }

  startProgress(): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    this.executeTicketAction(
      this.ticketService.updateStatus(
        ticketId,
        {
          status: 'IN_PROGRESS'
        }
      ),
      'Ticket moved to in progress.'
    );
  }

  resolve(): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    this.executeTicketAction(
      this.ticketService.updateStatus(
        ticketId,
        {
          status: 'RESOLVED'
        }
      ),
      'Ticket resolved successfully.'
    );
  }

  confirm(): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    this.executeTicketAction(
      this.ticketService.updateStatus(
        ticketId,
        {
          status: 'CONFIRMED'
        }
      ),
      'Ticket confirmed successfully.'
    );
  }

  closeTicket(): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    this.executeTicketAction(
      this.ticketService.close(
        ticketId,
        {
          resolution:
            this.ticket()?.resolution ??
            'Ticket completed and verified.'
        }
      ),
      'Ticket closed successfully.'
    );
  }

  createWorkOrder(): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    this.actionLoading.set(true);

    this.ticketService
      .createWorkOrder(ticketId)
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.actionLoading.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.toast.success(
            'Work order created successfully.'
          );

          void this.navigateByUrl(
            `/tenant/work-orders/${response.data.workOrderId}`
          );
        },
        error: error => {
          this.showError(
            error,
            'Unable to create the work order.'
          );
        }
      });
  }

  addComment(
    payload: CreateCommentPayload
  ): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    this.submittingComment.set(true);

    this.ticketService
      .addComment(
        ticketId,
        {
          comment: payload.message
        }
      )
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.submittingComment.set(false)
        )
      )
      .subscribe({
        next: response => {
          const comment =
            this.mapComment(response.data);

          this.comments.update(comments => [
            comment,
            ...comments
          ]);

          this.commentsComponent()
            ?.resetAfterSuccessfulSubmit();

          this.toast.success(
            'Comment added successfully.'
          );

          if (payload.files.length) {
            this.uploadCommentFiles(
              payload.files
            );
          }
        },
        error: error => {
          this.showError(
            error,
            'Unable to add the comment.'
          );
        }
      });
  }

  updateComment(
    payload: UpdateCommentPayload
  ): void {
    this.toast.info(
      'Comment update API is not connected yet.'
    );
  }

  deleteComment(
    commentId: number | string
  ): void {
    this.toast.info(
      `Delete comment ${commentId} API is not connected yet.`
    );
  }

  openCommentAttachment(
    attachment: CommentAttachment
  ): void {
    if (!attachment.downloadUrl) {
      return;
    }

    window.open(
      attachment.downloadUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  onAttachmentSelected(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    const files =
      Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    this.uploadCommentFiles(files);
    input.value = '';
  }

  prioritySeverity(
    priority: Priority
  ): 'danger' | 'warn' | 'info' | 'secondary' {
    switch (priority) {
      case 'CRITICAL':
        return 'danger';

      case 'HIGH':
        return 'warn';

      case 'MEDIUM':
        return 'info';

      default:
        return 'secondary';
    }
  }

  severityTag(
    severity: Severity
  ): 'danger' | 'warn' | 'info' {
    switch (severity) {
      case 'CRITICAL':
      case 'ERROR':
        return 'danger';

      case 'HIGH':
      case 'MEDIUM':
        return 'warn';

      default:
        return 'info';
    }
  }

  statusSeverity(
    status: TicketStatus
  ):
    | 'success'
    | 'warn'
    | 'danger'
    | 'info'
    | 'secondary' {
    switch (status) {
      case 'OPEN':
      case 'REOPENED':
        return 'danger';

      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return 'info';

      case 'IN_PROGRESS':
        return 'warn';

      case 'RESOLVED':
      case 'CONFIRMED':
      case 'CLOSED':
        return 'success';

      case 'REJECTED':
        return 'secondary';

      default:
        return 'info';
    }
  }

  slaLabel(
    minutes?: number | null,
    breached?: boolean
  ): string {
    if (breached) {
      return 'SLA breached';
    }

    if (
      minutes === null ||
      minutes === undefined
    ) {
      return 'Not available';
    }

    if (minutes <= 0) {
      return 'Due now';
    }

    const hours = Math.floor(
      minutes / 60
    );

    const remainingMinutes =
      minutes % 60;

    if (!hours) {
      return `${remainingMinutes}m remaining`;
    }

    return `${hours}h ${remainingMinutes}m remaining`;
  }

  private loadTicket(): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    this.startLoading();
    this.clearPageError();

    forkJoin({
      ticket:
        this.ticketService.getById(
          ticketId
        ),

      timeline:
        this.ticketService.getTimeline(
          ticketId
        ),

      comments:
        this.ticketService.getComments(
          ticketId
        ),

      attachments:
        this.ticketService.getAttachments(
          ticketId
        ),

      sla:
        this.ticketService.getSla(
          ticketId
        )
    })
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.stopLoading()
        )
      )
      .subscribe({
        next: response => {
          this.ticket.set(
            response.ticket.data
          );

          this.timeline.set(
            response.timeline.data ?? []
          );

          this.comments.set(
            (response.comments.data ?? [])
              .map(comment =>
                this.mapComment(comment)
              )
          );

          this.attachments.set(
            response.attachments.data ?? []
          );

          this.sla.set(
            response.sla.data
          );
        },
        error: error => {
          this.setPageError(
            error,
            'Unable to load ticket details.'
          );
        }
      });
  }

  private executeTicketAction(
    request: ReturnType<
      TicketService['updateStatus']
    >,
    successMessage: string
  ): void {
    this.actionLoading.set(true);

    request
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.actionLoading.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.ticket.set(response.data);
          this.toast.success(successMessage);
          this.reloadTimeline();
        },
        error: error => {
          this.showError(
            error,
            'Unable to update the ticket.'
          );
        }
      });
  }

  private reloadTimeline(): void {
    const ticketId = this.ticketId();

    if (!ticketId) {
      return;
    }

    this.loadingTimeline.set(true);

    this.ticketService
      .getTimeline(ticketId)
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.loadingTimeline.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.timeline.set(
            response.data ?? []
          );
        }
      });
  }

  private mapComment(
    comment: TicketComment
  ): EntityComment {
    return {
      id: comment.id,
      message: comment.comment,
      createdAt: comment.createdAt,
      updatedAt: comment.editedAt,
      createdById:
        comment.commentedByUserId ?? 0,
      createdByName:
        comment.commentedBy ??
        'Unknown user',
      edited: Boolean(
        comment.editedAt
      ),
      attachments: [],
      mentions: []
    };
  }

  private uploadCommentFiles(
    files: File[]
  ): void {
    const ticketId = this.ticketId();

    if (!ticketId || !files.length) {
      return;
    }

    this.uploadingAttachment.set(true);

    forkJoin(
      files.map(file =>
        this.ticketService.uploadAttachment(
  ticketId,
  file
)
      )
    )
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.uploadingAttachment.set(false)
        )
      )
      .subscribe({
        next: responses => {
          this.attachments.update(
            attachments => [
              ...responses.map(
                response => response.data
              ),
              ...attachments
            ]
          );

          this.toast.success(
            'Attachments uploaded successfully.'
          );
        },
        error: error => {
          this.showError(
            error,
            'One or more attachments could not be uploaded.'
          );
        }
      });
  }

  private slaClass(
    minutes?: number | null,
    breached?: boolean
  ): string {
    if (breached) {
      return 'to-ticket-detail__sla--danger';
    }

    if (
      minutes === null ||
      minutes === undefined
    ) {
      return 'to-ticket-detail__sla--neutral';
    }

    if (minutes <= 60) {
      return 'to-ticket-detail__sla--danger';
    }

    if (minutes <= 240) {
      return 'to-ticket-detail__sla--warning';
    }

    return 'to-ticket-detail__sla--success';
  }
}