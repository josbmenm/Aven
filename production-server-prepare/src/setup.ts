import { setupNginx } from './setup/Nginx';
import { setupMainServiceFiles } from './setup/MainServiceFiles';
import { setupMonitoringTools } from './setup/MonitoringTools';
import { setupDevTools } from './setup/DeveloperTools';
import { setupTimezone } from './setup/Timezone';
import { setupAptDependencies } from './setup/aptDependencies';
import { printOSInfo } from './utils/printOSInfo';

export async function setup() {
  // Initial smoke test
  await printOSInfo();

  await setupAptDependencies();

  // TODO: hostname, /etc/hosts

  // TODO: disable sshd password?

  await Promise.all([
    setupTimezone(),

    setupMonitoringTools(),

    setupDevTools(),

    setupNginx(),

    setupMainServiceFiles(),
  ]);

  console.log('Server configured!');
}

if (!module.parent) {
  setup().catch(e => {
    console.log('Error running!');
    console.log(e);
    process.exitCode = 1;
  });
}
