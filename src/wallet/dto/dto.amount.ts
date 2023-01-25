import { IsPositive } from 'class-validator';

export class AmountDTO {
  @IsPositive()
  amount: number;
}
