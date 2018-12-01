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

export function getListObjectsName(name) {
  if (name == null) {
    return null;
  }
  if (name === '_objects') {
    return '';
  }
  const match = name.match(/^(.*)\/_objects$/);
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
