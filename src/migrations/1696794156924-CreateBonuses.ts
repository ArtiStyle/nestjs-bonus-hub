import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBonuses1696794156924 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO public.bonus
      (bonus_limit, user_bonus_limit, is_active)
      VALUES (10, 2, true), (20, 5, true) ;`,
    );
  }

  public async down(): Promise<void> {}
}
