import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserService } from "../../user/user.service";

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (user && user.id) {
      this.userService.updateLastActiveAt(user.id);
    }

    return next.handle();
  }
}
