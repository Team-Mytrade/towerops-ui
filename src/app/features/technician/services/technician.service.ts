import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../core/api/api.types';
import { BaseService } from '../../../core/base/base.service';

import {
  AvailableTechnicianQuery,
  Technician,
  TechnicianAssignmentSummary,
  TechnicianAvailability,
  TechnicianListQuery,
  TechnicianPayload,
  TechnicianSkillPayload,
  UpdateTechnicianLocationPayload,
  UpdateTechnicianStatusPayload
} from '../models/technician.models';
import { TicketAttachment } from '../../tenant/tickets/models/ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TechnicianService extends BaseService {
  private readonly endpoint = 'technicians';

  getTechnicians(
    query?: TechnicianListQuery
  ): Observable<ApiResponse<Technician[]>> {
    return this.api.get<Technician[]>(
      this.endpoint,
      this.withQuery(query)
    );
  }

  getById(
    technicianId: number | string
  ): Observable<ApiResponse<Technician>> {
    return this.api.get<Technician>(
      this.buildUrl(
        this.endpoint,
        technicianId
      )
    );
  }

  create(
    payload: TechnicianPayload
  ): Observable<ApiResponse<Technician>> {
    return this.api.post<
      Technician,
      TechnicianPayload
    >(
      this.endpoint,
      payload
    );
  }

  update(
    technicianId: number | string,
    payload: TechnicianPayload
  ): Observable<ApiResponse<Technician>> {
    return this.api.put<
      Technician,
      TechnicianPayload
    >(
      this.buildUrl(
        this.endpoint,
        technicianId
      ),
      payload
    );
  }

  getAvailable(
    query?: AvailableTechnicianQuery
  ): Observable<ApiResponse<Technician[]>> {
    return this.api.get<Technician[]>(
      this.buildUrl(
        this.endpoint,
        'available'
      ),
      this.withQuery(query)
    );
  }

  getAvailability(
    technicianId: number | string
  ): Observable<ApiResponse<TechnicianAvailability>> {
    return this.api.get<TechnicianAvailability>(
      this.buildUrl(
        this.endpoint,
        technicianId,
        'availability'
      )
    );
  }

  getAssignmentSummary(
    technicianId: number | string
  ): Observable<ApiResponse<TechnicianAssignmentSummary>> {
    return this.api.get<TechnicianAssignmentSummary>(
      this.buildUrl(
        this.endpoint,
        technicianId,
        'assignment-summary'
      )
    );
  }

  updateStatus(
    technicianId: number | string,
    payload: UpdateTechnicianStatusPayload
  ): Observable<ApiResponse<Technician>> {
    return this.api.patch<
      Technician,
      UpdateTechnicianStatusPayload
    >(
      this.buildUrl(
        this.endpoint,
        technicianId,
        'status'
      ),
      payload
    );
  }

  updateLocation(
    technicianId: number | string,
    payload: UpdateTechnicianLocationPayload
  ): Observable<ApiResponse<TechnicianAvailability>> {
    return this.api.patch<
      TechnicianAvailability,
      UpdateTechnicianLocationPayload
    >(
      this.buildUrl(
        this.endpoint,
        technicianId,
        'location'
      ),
      payload
    );
  }

  updateSkills(
    technicianId: number | string,
    payload: TechnicianSkillPayload
  ): Observable<ApiResponse<Technician>> {
    return this.api.patch<
      Technician,
      TechnicianSkillPayload
    >(
      this.buildUrl(
        this.endpoint,
        technicianId,
        'skills'
      ),
      payload
    );
  }

  enable(
    technicianId: number | string
  ): Observable<ApiResponse<Technician>> {
    return this.api.patch<Technician>(
      this.buildUrl(
        this.endpoint,
        technicianId,
        'enable'
      )
    );
  }

  disable(
    technicianId: number | string,
    reason?: string
  ): Observable<ApiResponse<Technician>> {
    return this.api.patch<
      Technician,
      { reason?: string }
    >(
      this.buildUrl(
        this.endpoint,
        technicianId,
        'disable'
      ),
      { reason }
    );
  }

  
}