import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

type JobStatus = 'In progress' | 'Next' | 'Scheduled';
type JobPriority = 'Critical' | 'High' | 'Routine';
type TagSeverity = 'danger' | 'warn' | 'info' | 'secondary';

interface FieldJob {
  id: string;
  title: string;
  site: string;
  location: string;
  time: string;
  duration: string;
  status: JobStatus;
  priority: JobPriority;
  icon: string;
}

const PRIORITY_SEVERITY: Record<JobPriority, TagSeverity> = {
  Critical: 'danger',
  High: 'warn',
  Routine: 'info'
};

@Component({
  selector: 'to-technician-dashboard',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, TagModule],
  templateUrl: './technician-dashboard.html',
  styleUrl: './technician-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnicianDashboard {
  readonly scheduleDate = signal('Today · Aug 3');
  readonly isSyncing = signal(false);
  readonly activeJob = signal('WO-2841');
  readonly scheduleDates = ['Today · Aug 3', 'Tomorrow · Aug 4', 'This week'];

  readonly jobs: FieldJob[] = [
    { id: 'WO-2841', title: 'Replace backup battery bank', site: 'Lusail North Station', location: 'Lusail · 12.4 km away', time: '9:00 AM', duration: '2h 30m', status: 'In progress', priority: 'Critical', icon: 'pi-bolt' },
    { id: 'WO-2837', title: 'Inspect antenna alignment', site: 'Al Rayyan Hub', location: 'Al Rayyan · 18.7 km away', time: '1:00 PM', duration: '1h 15m', status: 'Next', priority: 'High', icon: 'pi-wifi' },
    { id: 'WO-2829', title: 'Quarterly generator service', site: 'Doha Central Tower', location: 'West Bay · 7.2 km away', time: '3:30 PM', duration: '1h 45m', status: 'Scheduled', priority: 'Routine', icon: 'pi-cog' }
  ];

  sync(): void {
    this.isSyncing.set(true);
    window.setTimeout(() => this.isSyncing.set(false), 600);
  }

  selectJob(job: FieldJob): void {
    this.activeJob.set(job.id);
  }

  prioritySeverity(priority: JobPriority): TagSeverity {
    return PRIORITY_SEVERITY[priority];
  }
}
