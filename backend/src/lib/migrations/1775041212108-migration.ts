import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1775041212108 implements MigrationInterface {
    name = 'Migration1775041212108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sessions_status_enum" AS ENUM('running', 'jackpot', 'expired')`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."sessions_status_enum" NOT NULL DEFAULT 'running', "use_random_numbers" boolean NOT NULL DEFAULT false, "player_numbers" integer array, "speed_ms" integer NOT NULL DEFAULT '1000', "total_draws" integer NOT NULL DEFAULT '0', "started_at" TIMESTAMP NOT NULL DEFAULT now(), "ended_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "winning_draws" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid NOT NULL, "draw_number" integer NOT NULL, "player_numbers" integer array NOT NULL, "drawn_numbers" integer array NOT NULL, "hits" smallint NOT NULL, "drawn_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1f30b733a96d709ca6a4a3a84a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "winning_draws" ADD CONSTRAINT "FK_459d6283604dbaaeed13c6f21e0" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "winning_draws" DROP CONSTRAINT "FK_459d6283604dbaaeed13c6f21e0"`);
        await queryRunner.query(`DROP TABLE "winning_draws"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_status_enum"`);
    }

}
