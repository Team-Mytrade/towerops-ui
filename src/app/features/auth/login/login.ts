import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { environment } from '../../../../environments/environment';
import { BaseFormComponent } from '../../../core/base/base-form.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'to-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login extends BaseFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loginError = signal<string | null>(null);

  readonly appName = environment.app.displayName;
  readonly version = environment.app.version;
  readonly build = environment.app.build;

  readonly form = this.formBuilder.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(150)
      ]
    ]
  });

  submit(): void {
    this.loginError.set(null);

    if (!this.validateForm()) {
      return;
    }

    this.startSubmitting();

    this.authService
      .login(this.form.getRawValue())
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopSubmitting())
      )
      .subscribe({
        next: () => {
          this.toast.success('Signed in successfully.');

          const returnUrl =
            this.activatedRoute.snapshot.queryParamMap.get(
              'returnUrl'
            );

          void this.navigateByUrl(
            returnUrl ||
              this.authService.getDefaultRoute()
          );
        },
        error: error => {
          const message = this.getErrorMessage(
            error,
            'Unable to sign in. Check your credentials and try again.'
          );

          this.loginError.set(message);
          this.toast.error(message);
        }
      });
  }

  usernameError(): string | null {
    return this.getControlError(
      'username',
      'Username'
    );
  }

  passwordError(): string | null {
    return this.getControlError(
      'password',
      'Password'
    );
  }
}