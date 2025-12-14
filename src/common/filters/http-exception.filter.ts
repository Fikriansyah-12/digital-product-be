import { ArgumentsHost, Catch, HttpException,  } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) :void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const res :any = ctx.getResponse();
    const status :number = exception.getStatus();
    const payload = exception.getResponse() as any;
    const message :any = typeof payload === 'string' ? payload :
    Array.isArray(payload?.message) ? payload.message:payload?.message ?? exception.message
    const errors: any = payload?.error ?? payload?.errors ?? null;

    res.status().json({
      status: 'error',
      code: status,
      message:Array.isArray(message) ? message.join(', ') : message,
      data: null,
      ...(errors ? { errors } : {})
    })
  }
}
