import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn =(req, next) => {

  const token =
    localStorage.getItem('token');

  console.log('TOKEN:', token); //debug statement to check if token is being retrieved

  if (token) { //only adds the authorization header if a token exists

    req = req.clone({

      setHeaders: {

        Authorization: 
          `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};