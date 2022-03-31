import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/common/roles';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class UserGuard extends AuthGuard('jwt') {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context);
    if (!valid) throw new UnauthorizedException();

    const payload: { role: Role; uid: number } = context.switchToHttp().getRequest().user;
    if (!['Elderly', 'Caretaker'].includes(payload.role)) throw new ForbiddenException();

    const user = await this.userRepository.findOne({ where: { uid: payload.uid } });
    if (!user) throw new UnauthorizedException(); // check if user exists
    return true;
  }
}

@Injectable()
export class ElderlyGuard extends AuthGuard('jwt') {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context);
    if (!valid) throw new UnauthorizedException();

    const payload = context.switchToHttp().getRequest().user;
    if (payload.role !== 'Elderly') throw new ForbiddenException(); // check role in jwt

    const elderly = await this.userRepository.findOne({ where: { uid: payload.uid, isElderly: true } });
    if (!elderly) throw new UnauthorizedException(); // check if user exists
    if (!elderly.isElderly) throw new ForbiddenException(); // check if user is really a elderly
    return true;
  }
}

@Injectable()
export class CaretakerGuard extends AuthGuard('jwt') {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context);
    if (!valid) throw new UnauthorizedException();

    const payload = context.switchToHttp().getRequest().user;
    if (payload.role !== 'Caretaker') throw new ForbiddenException(); // check role in jwt

    const caretaker = await this.userRepository.findOne({ where: { uid: payload.uid, isElderly: false } });
    if (!caretaker) throw new UnauthorizedException(); // check if user exists
    if (caretaker.isElderly) throw new ForbiddenException(); // check if user is really a caretaker
    return true;
  }
}
