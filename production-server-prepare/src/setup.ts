import { setupNginx } from './setup/Nginx';
import { setupMainServiceFiles } from './setup/MainServiceFiles';
import { setupMonitoringTools } from './setup/MonitoringTools';
import { setupDevTools } from './setup/DeveloperTools';
import { basicServerSetup } from './setup/basicServer';
import { printOSInfo } from './utils/printOSInfo';

export async function setup() {
  // Initial smoke test
  await printOSInfo();

  await basicServerSetup();

  await Promise.all([
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
