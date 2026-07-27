import { Routes } from '@angular/router';

import { roleGuard } from '../../../core/guards/role.guard';

const allowedUserTypes = [
  'TENANT_ADMIN',
  'ADMIN'
];

export const TICKET_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: {
      userTypes: allowedUserTypes
    },
    loadComponent: () =>
      import(
        './pages/tickets-list/tickets-list'
      ).then(
        module => module.TicketsListComponent
      )
  },
//   {
//     path: ':ticketId',
//     canActivate: [roleGuard],
//     data: {
//       userTypes: allowedUserTypes
//     },
//     loadComponent: () =>
//       import(
//         './pages/ticket-detail/ticket-detail'
//       ).then(
//         module => module.TicketDetailComponent
//       )
//   }
];