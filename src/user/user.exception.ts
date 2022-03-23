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
export class DuplicateElementException extends HttpException {
  constructor(element: string) {
    super(`${element} already exists`, HttpStatus.BAD_REQUEST)
  }
}
