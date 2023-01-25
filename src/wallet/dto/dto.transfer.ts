import { IsPositive } from 'class-validator';

export class TransferDTO {
  @IsPositive()
  amount: number;

  @IsPositive()
  recipient: number;
}
