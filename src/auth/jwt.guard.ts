import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { UsersService } from "src/users/users.service"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

@Injectable()
export class UserGuard extends AuthGuard("jwt") {
  constructor(private readonly userService: UsersService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) throw new UnauthorizedException()
    const payload = context.switchToHttp().getRequest().user
    if (!["Elderly", "Caretaker"].includes(payload.role)) throw new ForbiddenException()
    const user = await this.userService.findById(context.switchToHttp().getRequest().user.userId)
    if (user === null) throw new UnauthorizedException() 
    return true
  }
}

@Injectable()
export class ElderlyGuard extends AuthGuard("jwt") {
  constructor(private readonly elderlyService: UsersService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) throw new UnauthorizedException()
    const payload = context.switchToHttp().getRequest().user
    if (payload.role !== "Elderly") throw new ForbiddenException() // check role in jwt
    const elderly = await this.elderlyService.findById(context.switchToHttp().getRequest().user.userId)
    if (elderly === null) throw new UnauthorizedException() // check if user exists
    if (elderly.isElderly) throw new ForbiddenException() // check if user is really a elderly
    return true
  }
}

@Injectable()
export class CaretakerGuard extends AuthGuard("jwt") {
  constructor(private readonly caretakerService: UsersService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context)
    if (!valid) throw new UnauthorizedException()
    const payload = context.switchToHttp().getRequest().user
    if (payload.role !== "Caretaker") throw new ForbiddenException() // check role in jwt
    const caretaker = await this.caretakerService.findById(context.switchToHttp().getRequest().user.userId)
    if (caretaker === null) throw new UnauthorizedException() // check if user exists
    if (!caretaker.isElderly) throw new ForbiddenException() // check if user is really a caretaker
    return true
  }
}