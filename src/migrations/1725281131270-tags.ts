import { MigrationInterface, QueryRunner } from "typeorm";

export class Tags1725281131270 implements MigrationInterface {
    name = 'Tags1725281131270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_tag" ("question_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_1b280c31469075075860df9d6b0" PRIMARY KEY ("question_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c1908d5b6571f3154cda55a134" ON "question_tag" ("question_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bd2136aacc58fb57e8ee17b684" ON "question_tag" ("tag_id") `);
        await queryRunner.query(`ALTER TABLE "question_tag" ADD CONSTRAINT "FK_c1908d5b6571f3154cda55a1346" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "question_tag" ADD CONSTRAINT "FK_bd2136aacc58fb57e8ee17b6845" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_tag" DROP CONSTRAINT "FK_bd2136aacc58fb57e8ee17b6845"`);
        await queryRunner.query(`ALTER TABLE "question_tag" DROP CONSTRAINT "FK_c1908d5b6571f3154cda55a1346"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd2136aacc58fb57e8ee17b684"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c1908d5b6571f3154cda55a134"`);
        await queryRunner.query(`DROP TABLE "question_tag"`);
        await queryRunner.query(`DROP TABLE "tags"`);
    }

}
