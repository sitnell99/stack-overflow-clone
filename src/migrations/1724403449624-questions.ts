import { MigrationInterface, QueryRunner } from "typeorm";

export class Questions1724403449624 implements MigrationInterface {
    name = 'Questions1724403449624'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "questions" ("id" SERIAL NOT NULL, "author_id" integer NOT NULL, "title" character varying NOT NULL, "body" character varying NOT NULL, "accepted_answer_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "authorIdId" integer, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_b961aa8e40aba8ea13c93ddcb3b" FOREIGN KEY ("authorIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_b961aa8e40aba8ea13c93ddcb3b"`);
        await queryRunner.query(`DROP TABLE "questions"`);
    }

}
