import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bonus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'bonus_limit', type: 'smallint' })
  bonusLimit: number;

  @Column({ name: 'user_bonus_limit', type: 'smallint' })
  userBonusLimit: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
