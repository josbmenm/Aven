function getBoundIsStatement(node) {
  if (node.setValue) {
    return node.setValue;
  }
  return (node.setValue = val => {
    node.value = val;
  });
}

export default function Lang() {
  const dictionary = {};

  const knowledge = {};

  function getKnowledgeNode(name, context = knowledge) {
    if (knowledge[name]) {
      return knowledge[name];
    }
    return (knowledge[name] = {});
  }

  function the(name) {
    const node = getKnowledgeNode(name);
    return {
      ofThe: contextName => {
        return {
          is: getBoundIsStatement(node),
        };
      },
      is: value => {
        knowledge[name] = value;
      },
    };
  }

  const what = {
    // primary mechanism for answering a query..
    is: {
      the: name => {
        return getKnowledgeNode(name).value;
      },
    },
  };

  return { the, what };
}
