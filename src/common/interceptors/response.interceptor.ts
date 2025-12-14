import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE, RESPONSE_OPTS, ResponseOpts } from '../decorators/response.decorator';
import { statusConstant } from 'src/constants/status.constant';

type Envelope<T> = {
  status: 'success' | 'error';
  code: number;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    nextPage?: number | null;
    prevPage?: number | null;
  };
};

function defaultMessageByStatusCode(code: number): string {
  switch (code) {
    case 200:
      return 'OK';
    case 201:
      return 'Created';
    case 202:
      return 'Accepted';
    case 204:
      return 'No Content';
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 500:
      return 'Internal Server Error';
    default:
      return 'Response';
  }
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Envelope<T>> {
  constructor(private readonly reflector: Reflector) {}

  private camelToSnakeCase(obj: any, keyName?: string): any {
    if (obj instanceof Date) {
      if (keyName && /_date$/.test(keyName)) {
        return obj.toISOString().split('T')[0];
      }
      return obj.toISOString();
    }
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }
    if(Array.isArray(obj)){
      return obj.map((item) => this.camelToSnakeCase(item));
    }
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const snakeKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`,
        );
        return [snakeKey, this.camelToSnakeCase(value, snakeKey)];
      }),
    )
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<Envelope<T>> {
    const http = context.switchToHttp();
    const res = http.getResponse();
    const messageMeta = this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE, [
      context.getHandler(),
      context.getClass(),
    ]);

    const otpsMeta = this.reflector.getAllAndOverride<ResponseOpts>(RESPONSE_OPTS, [
      context.getHandler(),
      context.getClass(),
    ]);

    if(otpsMeta?.code) res.statusCode = otpsMeta.code;

    return next.handle().pipe(
      map((raw : any) => {
        const code = res.statusCode || 200;
        const message = otpsMeta?.message ?? messageMeta ?? defaultMessageByStatusCode(code);
        const isPagination = 
        raw && 
        typeof raw === 'object' &&
        Array.isArray(raw.data) &&
        Number.isFinite(raw.count) &&
        Number.isFinite(raw.pageSize) &&
        Number.isFinite(raw.page);

        if(isPagination){
          const rows = raw.data
          const total = Number(raw.count);
          const page = Number(raw.page);
          const limit = Number(raw.pageSize);
          const totalPage = limit > 0 ? Math.ceil(total / limit) : 0;
          const nextPage = page < totalPage ? page + 1 : null;
          const prevPage = page > 1 ? page - 1 : null;

          return {
            code,
            status: statusConstant.SUCCESS,
            message,
            data: this.camelToSnakeCase(rows),
            meta: {
              total,
              page,
              limit,
              totalPages: totalPage,
              nextPage,
              prevPage
            }
          } as any
        }
        const isAuthPayload =
          raw &&
          typeof raw === 'object' &&
          ('accessToken' in raw);
          if(otpsMeta?.leaveToken && isAuthPayload){
            return {
              code,
              status: statusConstant.SUCCESS,
              message,
              data: this.camelToSnakeCase(raw),
              accessToken: raw.accessToken
            } as any
          }

          return {
            code,
            status: statusConstant.SUCCESS,
            message,
            data: this.camelToSnakeCase(raw),
          } as any
      })
    );
  }
}
