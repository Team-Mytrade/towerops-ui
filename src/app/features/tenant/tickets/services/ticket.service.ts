import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../../core/api/api.types';
import { BaseService } from '../../../../core/base/base.service';

import {
  AssignTechnicianPayload,
  CloseTicketPayload,
  CreateTicketCommentPayload,
  RejectTicketPayload,
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketListQuery,
  TicketPayload,
  TicketSla,
  TicketSummary,
  TicketTimelineItem,
  TicketWorkOrderResponse,
  UpdateTicketPriorityPayload,
  UpdateTicketStatusPayload,
  VerifyTicketPayload
} from '../models/ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TicketService extends BaseService {
  private readonly endpoint = 'tickets';

  getTickets(
    query?: TicketListQuery
  ): Observable<ApiResponse<Ticket[]>> {
    return this.api.get<Ticket[]>(
      this.endpoint,
      this.withQuery(query)
    );
  }

  getById(
    ticketId: number | string
  ): Observable<ApiResponse<Ticket>> {
    return this.api.get<Ticket>(
      this.buildUrl(
        this.endpoint,
        ticketId
      )
    );
  }

  getSummary(
    query?: Pick<
      TicketListQuery,
      | 'siteId'
      | 'deviceId'
      | 'technicianId'
      | 'fromDate'
      | 'toDate'
    >
  ): Observable<ApiResponse<TicketSummary>> {
    return this.api.get<TicketSummary>(
      this.buildUrl(
        this.endpoint,
        'summary'
      ),
      this.withQuery(query)
    );
  }

  create(
    payload: TicketPayload
  ): Observable<ApiResponse<Ticket>> {
    return this.api.post<
      Ticket,
      TicketPayload
    >(
      this.endpoint,
      payload
    );
  }

  update(
    ticketId: number | string,
    payload: TicketPayload
  ): Observable<ApiResponse<Ticket>> {
    return this.api.put<
      Ticket,
      TicketPayload
    >(
      this.buildUrl(
        this.endpoint,
        ticketId
      ),
      payload
    );
  }

  assignTechnician(
    ticketId: number | string,
    payload: AssignTechnicianPayload
  ): Observable<ApiResponse<Ticket>> {
    return this.api.patch<
      Ticket,
      AssignTechnicianPayload
    >(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'assign'
      ),
      payload
    );
  }

  updateStatus(
    ticketId: number | string,
    payload: UpdateTicketStatusPayload
  ): Observable<ApiResponse<Ticket>> {
    return this.api.patch<
      Ticket,
      UpdateTicketStatusPayload
    >(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'status'
      ),
      payload
    );
  }

  updatePriority(
    ticketId: number | string,
    payload: UpdateTicketPriorityPayload
  ): Observable<ApiResponse<Ticket>> {
    return this.api.patch<
      Ticket,
      UpdateTicketPriorityPayload
    >(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'priority'
      ),
      payload
    );
  }

  verify(
    ticketId: number | string,
    payload: VerifyTicketPayload
  ): Observable<ApiResponse<Ticket>> {
    return this.api.patch<
      Ticket,
      VerifyTicketPayload
    >(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'verify'
      ),
      payload
    );
  }

  close(
    ticketId: number | string,
    payload: CloseTicketPayload
  ): Observable<ApiResponse<Ticket>> {
    return this.api.patch<
      Ticket,
      CloseTicketPayload
    >(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'close'
      ),
      payload
    );
  }

  reject(
    ticketId: number | string,
    payload: RejectTicketPayload
  ): Observable<ApiResponse<Ticket>> {
    return this.api.patch<
      Ticket,
      RejectTicketPayload
    >(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'reject'
      ),
      payload
    );
  }

  reopen(
    ticketId: number | string,
    remarks?: string
  ): Observable<ApiResponse<Ticket>> {
    return this.api.patch<
      Ticket,
      { remarks?: string }
    >(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'reopen'
      ),
      { remarks }
    );
  }

  cancel(
    ticketId: number | string,
    reason: string
  ): Observable<ApiResponse<Ticket>> {
    return this.api.patch<
      Ticket,
      { reason: string }
    >(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'cancel'
      ),
      { reason }
    );
  }

  getTimeline(
    ticketId: number | string
  ): Observable<ApiResponse<TicketTimelineItem[]>> {
    return this.api.get<TicketTimelineItem[]>(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'timeline'
      )
    );
  }

  getComments(
    ticketId: number | string
  ): Observable<ApiResponse<TicketComment[]>> {
    return this.api.get<TicketComment[]>(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'comments'
      )
    );
  }

  addComment(
    ticketId: number | string,
    payload: CreateTicketCommentPayload
  ): Observable<ApiResponse<TicketComment>> {
    return this.api.post<
      TicketComment,
      CreateTicketCommentPayload
    >(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'comments'
      ),
      payload
    );
  }

  getAttachments(
    ticketId: number | string
  ): Observable<ApiResponse<TicketAttachment[]>> {
    return this.api.get<TicketAttachment[]>(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'attachments'
      )
    );
  }

  getSla(
    ticketId: number | string
  ): Observable<ApiResponse<TicketSla>> {
    return this.api.get<TicketSla>(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'sla'
      )
    );
  }
uploadAttachment(
  ticketId: number | string,
  file: File
): Observable<ApiResponse<TicketAttachment>> {
  const formData = new FormData();

  formData.append(
    'file',
    file,
    file.name
  );

  return this.api.postFormData<TicketAttachment>(
    this.buildUrl(
      this.endpoint,
      ticketId,
      'attachments'
    ),
    formData
  );
}
  createWorkOrder(
    ticketId: number | string
  ): Observable<ApiResponse<TicketWorkOrderResponse>> {
    return this.api.post<TicketWorkOrderResponse>(
      this.buildUrl(
        this.endpoint,
        ticketId,
        'work-orders'
      )
    );
  }
}