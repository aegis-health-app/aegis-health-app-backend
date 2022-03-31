import { Transform } from 'class-transformer';

export function ToBoolean() {
  return Transform((v) => {
    return ['1', 1, 'true', true].includes(v.value);
  });
}
