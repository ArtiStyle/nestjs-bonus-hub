import { IsNotEmpty } from 'class-validator';

export class ProduceBonusDto {
  @IsNotEmpty()
  bonusIds: number[];

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  uuid: string;
}
