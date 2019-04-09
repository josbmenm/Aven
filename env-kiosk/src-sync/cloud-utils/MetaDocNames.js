export function getListDocName(name) {
  if (name == null) {
    return null;
  }
  if (name === '_children') {
    return '';
  }
  const match = name.match(/^(.*)\/_children$/);
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

export function getAuthDocName(name) {
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
