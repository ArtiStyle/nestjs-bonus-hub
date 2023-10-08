import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['userId', 'bonusId', 'eventId'], { unique: true })
export class ProducedBonus {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('user_id_index')
  @Column({ name: 'user_id' })
  userId: number;

  @Index('bonus_id_index')
  @Column({ name: 'bonus_id' })
  bonusId: number;

  @Index('event_id_index')
  @Column({ name: 'event_id' })
  eventId: string;
}
