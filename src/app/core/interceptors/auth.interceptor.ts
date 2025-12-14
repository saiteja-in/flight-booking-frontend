import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Add withCredentials to all requests to ensure HttpOnly cookies are sent
  // The JWT token is stored in an HttpOnly cookie by the backend and sent automatically
  req = req.clone({
    withCredentials: true
  });

  return next(req);
};
