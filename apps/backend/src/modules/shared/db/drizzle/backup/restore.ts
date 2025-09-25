import { $, Glob } from "bun";
import { env } from "@env";

const restorePgBackup = async () => {
  console.log("Restoring backup process started");

  const glob: Glob = new Glob("*.sql");
  const filesName: Set<string> = new Set();
  for (const file of glob.scanSync(`${__dirname}/../database/backups/`)) {
    const backupFineName: string = file.split(".")[0];
    filesName.add(backupFineName);
  }
  const newestBackupFileName: string = Array.from(filesName.values()).sort(
    (a, b) => +b - +a,
  )[0];
  const sqlFilePath: string = `/app/src/database/backups/${newestBackupFileName}.sql`;
  await $`PGPASSWORD=${env.POSTGRES_PASSWORD} psql -U ${env.POSTGRES_USER} -h postgres -d ${env.POSTGRES_DB} -f ${sqlFilePath}`;

  console.log("Restoring backup process ended successfully");
};

restorePgBackup();
