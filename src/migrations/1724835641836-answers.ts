import { MigrationInterface, QueryRunner } from "typeorm";

export class Answers1724835641836 implements MigrationInterface {
    name = 'Answers1724835641836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "answers" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "author_id" integer NOT NULL, "question_id" integer NOT NULL, "body" character varying NOT NULL, "authorIdId" integer, "questionId" integer, CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "acceptedAnswerIdId" integer`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "UQ_62586b6d8b44f2625a1346d2a34" UNIQUE ("acceptedAnswerIdId")`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_62586b6d8b44f2625a1346d2a34" FOREIGN KEY ("acceptedAnswerIdId") REFERENCES "answers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_7addf2f15d836920f88e90a08c6" FOREIGN KEY ("authorIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_c38697a57844f52584abdb878d7" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_c38697a57844f52584abdb878d7"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_7addf2f15d836920f88e90a08c6"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_62586b6d8b44f2625a1346d2a34"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "UQ_62586b6d8b44f2625a1346d2a34"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "acceptedAnswerIdId"`);
        await queryRunner.query(`DROP TABLE "answers"`);
    }

}
