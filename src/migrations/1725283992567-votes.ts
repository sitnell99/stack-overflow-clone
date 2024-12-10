import { MigrationInterface, QueryRunner } from "typeorm";

export class Votes1725283992567 implements MigrationInterface {
    name = 'Votes1725283992567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "votes" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "voter_id" integer NOT NULL, "question_id" integer, "answer_id" integer, "is_upvote" boolean NOT NULL, CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_907ed58b724f8debe4200e51af3" FOREIGN KEY ("voter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_64d599e35a82d2f4396e5380811" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_47c1b96c18bd04fa26f8a9fde96" FOREIGN KEY ("answer_id") REFERENCES "answers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_47c1b96c18bd04fa26f8a9fde96"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_64d599e35a82d2f4396e5380811"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_907ed58b724f8debe4200e51af3"`);
        await queryRunner.query(`DROP TABLE "votes"`);
    }

}
