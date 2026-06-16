import { ApplicationConfig } from '@angular/core';

import {provideRouter} from '@angular/router';

import {provideHttpClient,withInterceptors}from '@angular/common/http';

import { routes }from './app.routes';

import { authInterceptor }from './core/interceptors/auth-interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
export const appConfig:
ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    ),
    provideAnimations(), 
    provideToastr({      
      timeOut: 3000,                    // disappears after 3 seconds
      positionClass: 'toast-top-right', // position on screen
      preventDuplicates: true,          // don't show same toast twice
      progressBar: true,                // shows countdown bar
      closeButton: true                 // X button to dismiss manually
    })

  ]
};