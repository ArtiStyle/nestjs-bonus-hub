import { Injectable } from '@nestjs/common';
import { ProduceBonusDto } from './dto/produce-bonus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bonus } from './entities/bonus.entity';
import { Repository } from 'typeorm';
import { BonusPersistenceService } from './bonus.presistence-service';
import { BonusCount } from './dto/bonus-count.dto';
import { DbTransactionFactory } from 'src/DB/db.transaction';

@Injectable()
export class BonusBusinessService {
  constructor(
    @InjectRepository(Bonus)
    private readonly bonusRepository: Repository<Bonus>,
    private readonly bonusPersistenceService: BonusPersistenceService,
    private transactionRunner: DbTransactionFactory,
  ) {}

  async produce(produceBonusDto: ProduceBonusDto) {
    const transactionRunner = await this.transactionRunner.createTransaction();
    await transactionRunner.startTransaction();
    const transactionManager = transactionRunner.transactionManager;

    try {
      const { bonusIds: ids, userId, uuid: eventId } = produceBonusDto;

      const [activeBonuses, producedBonusesCount, prevEventBonuses] =
        await Promise.all([
          this.bonusPersistenceService.getActive(ids),
          this.bonusPersistenceService.getProducedCount(ids, userId),
          this.bonusPersistenceService.getProduced(userId, eventId),
        ]);

      let bonusesToProduce = this.filterUserBonusesLimit(
        activeBonuses,
        producedBonusesCount.producedBonusesByUser,
      );

      if (prevEventBonuses.length) {
        const prevIds = prevEventBonuses.map((i) => i.bonusId);
        bonusesToProduce = bonusesToProduce.filter(
          (i) => !prevIds.includes(i.id),
        );
      }

      const bonusesForDeactivate = this.getBonusesForDeactivate(
        bonusesToProduce,
        producedBonusesCount.producedBonuses,
      );

      const producedBonuses =
        await this.bonusPersistenceService.createProducedBonuses(
          userId,
          bonusesToProduce.map((i) => i.id),
          eventId,
          transactionManager,
        );

      await this.bonusPersistenceService.deactivate(
        bonusesForDeactivate.map((i) => i.id),
        transactionManager,
      );

      await transactionRunner.commitTransaction();

      return producedBonuses.map((i) => i.bonusId);
    } catch (e) {
      await transactionRunner.rollbackTransaction();
      throw e;
    } finally {
      await transactionRunner.releaseTransaction();
    }
  }

  private filterUserBonusesLimit(
    bonuses: Bonus[],
    userProducedBonuses: BonusCount[],
  ) {
    return bonuses.filter((bonus) => {
      const userProducedBonus = userProducedBonuses.find(
        (i) => i.bonusId === bonus.id,
      );

      return (
        !userProducedBonus ||
        parseInt(userProducedBonus.count, 10) < bonus.userBonusLimit
      );
    });
  }

  private getBonusesForDeactivate(
    bonuses: Bonus[],
    producedBonuses: BonusCount[],
  ) {
    return bonuses.filter((bonus) => {
      const producedBonus = producedBonuses.find((i) => i.bonusId === bonus.id);
      if (!producedBonus) return false;
      return parseInt(producedBonus.count, 10) + 1 >= bonus.bonusLimit;
    });
  }
}
