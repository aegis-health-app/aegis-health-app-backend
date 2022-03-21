import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

export function IsValidName(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidName',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: { message: 'Name must be valid', ...validationOptions },
      validator: {
        validate(value: any) {
          return !!value.toString().match(/^[\w.\-]+$/)
        },
      },
    })
  }
}
