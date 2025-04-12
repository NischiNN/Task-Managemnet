import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { jwtInterceptor, serverErrorInterceptor } from '@lib/interceptors';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withInterceptors([serverErrorInterceptor, jwtInterceptor])),
        provideAnimations(),
        provideToastr({
          positionClass: 'toast-top-right',
          timeOut: 3000,
        }),
    ],
};
