import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { BonusCount, ProducedBonusesCount } from './dto/bonus-count.dto';
import { Bonus } from './entities/bonus.entity';
import { ProducedBonus } from './entities/produced-bonus';

@Injectable()
export class BonusPersistenceService {
  constructor(
    @InjectRepository(Bonus)
    private readonly bonusRepository: Repository<Bonus>,
    @InjectRepository(ProducedBonus)
    private readonly producedBonusRepository: Repository<ProducedBonus>,
  ) {}

  private async get(
    bonusIds: number[],
    userId?: number,
  ): Promise<BonusCount[]> {
    const producedBonusesQuery = await this.producedBonusRepository
      .createQueryBuilder('pb')
      .select('pb.bonus_id', 'bonusId')
      .addSelect('COUNT(pb.id)', 'count')
      .where('pb.bonus_id IN (:...ids)', {
        ids: bonusIds,
      })
      .groupBy('pb.bonus_id');

    if (userId)
      producedBonusesQuery.andWhere('pb.user_id = :userId', {
        userId,
      });

    return producedBonusesQuery.getRawMany();
  }

  public async getProducedCount(
    ids: number[],
    userId: number,
  ): Promise<ProducedBonusesCount> {
    const promises = [this.get(ids), this.get(ids, userId)];

    const [producedBonuses, producedBonusesByUser] =
      await Promise.all(promises);

    return {
      producedBonuses,
      producedBonusesByUser,
    };
  }
  public async getProduced(userId: number, eventId?: string) {
    return this.producedBonusRepository.find({
      where: {
        userId,
        eventId,
      },
    });
  }

  public async getActive(ids: number[]) {
    return this.bonusRepository.find({
      where: {
        id: In(ids),
        isActive: true,
      },
    });
  }

  public async deactivate(
    ids: number[],
    transactionManager?: EntityManager,
  ): Promise<void> {
    transactionManager
      ? await transactionManager.update(
          Bonus,
          {
            id: In(ids),
          },
          {
            isActive: false,
          },
        )
      : await this.bonusRepository.update(
          {
            id: In(ids),
          },
          {
            isActive: false,
          },
        );
  }

  public async createProducedBonuses(
    userId: number,
    bonusIds: number[],
    eventId: string,
    transactionManager?: EntityManager,
  ): Promise<ProducedBonus[]> {
    const producedBonuses = bonusIds.map((bonusId) =>
      Object.assign(new ProducedBonus(), {
        userId,
        bonusId,
        eventId,
      }),
    );

    return transactionManager
      ? transactionManager.save(ProducedBonus, producedBonuses)
      : this.producedBonusRepository.save(producedBonuses);
  }
}
