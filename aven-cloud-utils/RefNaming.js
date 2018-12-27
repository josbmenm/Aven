export function getListRefName(name) {
  if (name == null) {
    return null;
  }
  if (name === '_refs') {
    return '';
  }
  const match = name.match(/^(.*)\/_refs$/);
  if (match) {
    return match[1];
  }
  return null;
}

export function getListBlocksName(name) {
  if (name == null) {
    return null;
  }
  if (name === '_blocks') {
    return '';
  }
  const match = name.match(/^(.*)\/_blocks$/);
  if (match) {
    return match[1];
  }
  return null;
}

export function getAuthRefName(name) {
  if (name == null) {
    return null;
  }
  if (name === '_auth') {
    return '';
  }
  const match = name.match(/^(.*)\/_auth$/);
  if (match) {
    return match[1];
  }
  return null;
}
