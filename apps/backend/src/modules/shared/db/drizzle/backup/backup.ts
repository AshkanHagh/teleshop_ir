import { $ } from "bun";
import { env } from "@env";

const postgresBackup = async () => {
  console.log("Backup process started");

  const sortableDateTime: string = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 15);
  const nosync: string = env.NODE_ENV === "production" ? "" : "--no-sync";
  const rowsPerInsert: string = "100";
  await $`PGPASSWORD=${env.POSTGRES_PASSWORD} pg_dump -U ${env.POSTGRES_USER} -h postgres -d ${env.POSTGRES_DB} --data-only --format=P --verbose --attribute-inserts --column-inserts --enable-row-security --no-comments ${nosync} --rows-per-insert=${rowsPerInsert} -f ./src/database/backups/${sortableDateTime}sql`;

  console.log("Backup process ended successfully");
};

const handelBackup = async (cron: string | undefined) => {
  if (cron) {
    setInterval(
      async () => {
        console.log(`${new Date()}: new backups have been created`);
        await postgresBackup();
      },
      1000 * 60 * 60 * 24 * 1,
    );
    return;
  }
  await postgresBackup();
  return;
};

await handelBackup(Bun.argv[2]);
