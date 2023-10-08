import { Module } from '@nestjs/common';
import { BonusBusinessService } from './bonus.business-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bonus } from './entities/bonus.entity';
import { ProducedBonus } from './entities/produced-bonus.entity.';
import { BonusPersistenceService } from './bonus.presistence-service';
import { DbTransactionFactory } from 'src/DB/db.transaction';
import { BonusController } from './bonus.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bonus, ProducedBonus])],
  providers: [
    BonusBusinessService,
    BonusPersistenceService,
    DbTransactionFactory,
    BonusController,
  ],
  controllers: [BonusController],
})
export class BonusModule {}
