export default function authenticateSource(
  source,
  authenticatedDomain,
  staticAuth,
) {
  async function observeDoc(domain, name, auth) {
    if (auth || domain !== authenticatedDomain) {
      return await source.observeDoc(domain, name, auth);
    }
    return await source.observeDoc(domain, name, staticAuth);
  }

  async function observeDocChildren(domain, name, auth) {
    if (auth || domain !== authenticatedDomain) {
      return await source.observeDocChildren(domain, name, auth);
    }
    return await source.observeDocChildren(domain, name, staticAuth);
  }

  async function dispatch(action) {
    if (action.auth || action.domain !== authenticatedDomain) {
      return await source.dispatch(action);
    }
    return await source.dispatch({ ...action, auth: staticAuth });
  }
  return {
    ...source,
    observeDoc,
    observeDocChildren,
    dispatch,
  };
}
