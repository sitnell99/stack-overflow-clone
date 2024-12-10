import { MigrationInterface, QueryRunner } from "typeorm";

export class FixDuplicatedColumns1725033185980 implements MigrationInterface {
    name = 'FixDuplicatedColumns1725033185980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_b961aa8e40aba8ea13c93ddcb3b"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_62586b6d8b44f2625a1346d2a34"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_7addf2f15d836920f88e90a08c6"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_c38697a57844f52584abdb878d7"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "authorIdId"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "UQ_62586b6d8b44f2625a1346d2a34"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "acceptedAnswerIdId"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP COLUMN "authorIdId"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP COLUMN "questionId"`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "UQ_8f308c37baf355ee59b66ff3a09" UNIQUE ("accepted_answer_id")`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_8f308c37baf355ee59b66ff3a09" FOREIGN KEY ("accepted_answer_id") REFERENCES "answers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_dcaac7adf4b5af7bc980ec5250e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_677120094cf6d3f12df0b9dc5d3" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_3a1ad37b311f0f3bdda728e507f" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_3a1ad37b311f0f3bdda728e507f"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_677120094cf6d3f12df0b9dc5d3"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_dcaac7adf4b5af7bc980ec5250e"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_8f308c37baf355ee59b66ff3a09"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "UQ_8f308c37baf355ee59b66ff3a09"`);
        await queryRunner.query(`ALTER TABLE "answers" ADD "questionId" integer`);
        await queryRunner.query(`ALTER TABLE "answers" ADD "authorIdId" integer`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "acceptedAnswerIdId" integer`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "UQ_62586b6d8b44f2625a1346d2a34" UNIQUE ("acceptedAnswerIdId")`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "authorIdId" integer`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_c38697a57844f52584abdb878d7" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_7addf2f15d836920f88e90a08c6" FOREIGN KEY ("authorIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_62586b6d8b44f2625a1346d2a34" FOREIGN KEY ("acceptedAnswerIdId") REFERENCES "answers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_b961aa8e40aba8ea13c93ddcb3b" FOREIGN KEY ("authorIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
