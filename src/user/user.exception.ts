import { HttpException, HttpStatus } from '@nestjs/common'

export class UserNotFoundException extends HttpException {
  constructor() {
    super('User not found', HttpStatus.BAD_REQUEST)
  }
}
export class InvalidUserTypeException extends HttpException {
  constructor() {
    super('Invalid user type', HttpStatus.BAD_REQUEST)
  }
}
export class DuplicateRelationshipException extends HttpException {
  constructor() {
    super('Relationship already exist', HttpStatus.BAD_REQUEST)
  }
}
