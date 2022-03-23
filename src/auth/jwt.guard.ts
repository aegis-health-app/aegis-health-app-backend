import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { UserService } from "src/user/user.service"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

@Injectable()
export class UserGuard extends AuthGuard("jwt") {
  constructor(private readonly userService: UserService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) throw new UnauthorizedException()

    const payload = context.switchToHttp().getRequest().user
    if (!["Elderly", "Caretaker"].includes(payload.role)) throw new ForbiddenException()

    const user = await this.userService.findUserById(payload.userId) 
    if (user === null) throw new UnauthorizedException() // check if user exists
    return true
  }
}

@Injectable()
export class ElderlyGuard extends AuthGuard("jwt") {
  constructor(private readonly elderlyService: UserService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) throw new UnauthorizedException()

    const payload = context.switchToHttp().getRequest().user
    if (payload.role !== "Elderly") throw new ForbiddenException() // check role in jwt

    const elderly = await this.elderlyService.findElderlyById(payload.userId)
    if (elderly === null) throw new UnauthorizedException() // check if user exists
    if (!elderly.isElderly) throw new ForbiddenException() // check if user is really a elderly
    return true
  }
}

@Injectable()
export class CaretakerGuard extends AuthGuard("jwt") {
  constructor(private readonly caretakerService: UserService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) throw new UnauthorizedException()

    const payload = context.switchToHttp().getRequest().user
    if (payload.role !== "Caretaker") throw new ForbiddenException() // check role in jwt

    const caretaker = await this.caretakerService.findCaretakerById(payload.userId)
    if (caretaker === null) throw new UnauthorizedException() // check if user exists
    if (caretaker.isElderly) throw new ForbiddenException() // check if user is really a caretaker
    return true
  }
}