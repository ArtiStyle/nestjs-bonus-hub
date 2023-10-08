import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

export abstract class ITransactionRunner {
  abstract startTransaction(): Promise<void>;
  abstract commitTransaction(): Promise<void>;
  abstract rollbackTransaction(): Promise<void>;
  abstract releaseTransaction(): Promise<void>;
}

class TransactionRunner implements ITransactionRunner {
  private hasTransactionDestroyed = false;
  constructor(private readonly queryRunner: QueryRunner) {}

  async startTransaction(): Promise<void> {
    if (this.queryRunner.isTransactionActive) return;
    return this.queryRunner.startTransaction();
  }

  async commitTransaction(): Promise<void> {
    if (this.hasTransactionDestroyed) return;
    return this.queryRunner.commitTransaction();
  }

  async rollbackTransaction(): Promise<void> {
    if (this.hasTransactionDestroyed) return;
    console.log('ROLL BACK');
    return this.queryRunner.rollbackTransaction();
  }

  async releaseTransaction(): Promise<void> {
    this.hasTransactionDestroyed = true;
    console.log('RELEASE');
    return this.queryRunner.release();
  }

  get transactionManager(): EntityManager {
    return this.queryRunner.manager;
  }
}

@Injectable()
export class DbTransactionFactory {
  constructor(private readonly dataSource: DataSource) {}

  async createTransaction(): Promise<TransactionRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    return new TransactionRunner(queryRunner);
  }
}
