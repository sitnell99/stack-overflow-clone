import { MigrationInterface, QueryRunner } from "typeorm";

export class ColumnNameAuthorToUser1725350091732 implements MigrationInterface {
    name = 'ColumnNameAuthorToUser1725350091732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_3a1ad37b311f0f3bdda728e507f"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_dcaac7adf4b5af7bc980ec5250e"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_907ed58b724f8debe4200e51af3"`);
        await queryRunner.query(`ALTER TABLE "answers" RENAME COLUMN "author_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "questions" RENAME COLUMN "author_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "votes" RENAME COLUMN "voter_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_f4cf663ebeca05b7a12f6a2cc97" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_5800cd25a5888174b2c40e67d4b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_27be2cab62274f6876ad6a31641" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_27be2cab62274f6876ad6a31641"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_5800cd25a5888174b2c40e67d4b"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_f4cf663ebeca05b7a12f6a2cc97"`);
        await queryRunner.query(`ALTER TABLE "votes" RENAME COLUMN "user_id" TO "voter_id"`);
        await queryRunner.query(`ALTER TABLE "questions" RENAME COLUMN "user_id" TO "author_id"`);
        await queryRunner.query(`ALTER TABLE "answers" RENAME COLUMN "user_id" TO "author_id"`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_907ed58b724f8debe4200e51af3" FOREIGN KEY ("voter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_dcaac7adf4b5af7bc980ec5250e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_3a1ad37b311f0f3bdda728e507f" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
