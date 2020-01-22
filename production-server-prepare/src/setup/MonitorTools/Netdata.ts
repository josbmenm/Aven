import { exec } from '../../utils/spawn';

export async function setupNetdata() {
  // Nightly is recommended by Netdata https://docs.netdata.cloud/packaging/installer/#nightly-vs-stable-releases
  const installScriptNightly = 'https://my-netdata.io/kickstart.sh';
  const installScriptStable = 'https://my-netdata.io/kickstart-static64.sh';

  await exec(`bash <(curl -Ss "${installScriptStable}") --dont-wait`);

  // TODO: configure to work with nginx?
}
