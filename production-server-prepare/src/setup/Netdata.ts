import { exec } from '../utils/spawn';

export async function setupNetdata() {
  // Nightly is recommended by Netdata https://docs.netdata.cloud/packaging/installer/#nightly-vs-stable-releases

  // const installScript = 'https://my-netdata.io/kickstart.sh'; // Nightly
  const installScript = 'https://my-netdata.io/kickstart-static64.sh'; // Stable

  await exec(`bash <(curl -Ss "${installScript}") --dont-wait`);

  // TODO: configure to work with nginx?
}
