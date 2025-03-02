module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce Firestore converters for collection references",
      category: "Best Practices",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedCollections: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingConverter:
        "Firestore collection reference must use a converter. Add .withConverter()",
    },
  },
  create(context) {
    const { allowedCollections = [] } = context.options[0] || {};

    function isCollectionCall(node) {
      // Match both db.collection(...) and collection(...)
      return (
        // db.collection(...)
        (node.callee.type === "MemberExpression" &&
          ["collection", "collectionGroup"].includes(
            node.callee.property.name
          )) ||
        // collection(db, ...)
        (node.callee.type === "Identifier" &&
          ["collection", "collectionGroup"].includes(node.callee.name))
      );
    }

    function hasWithConverter(node) {
      let current = node.parent;
      while (current) {
        if (
          current.type === "CallExpression" &&
          current.callee.type === "MemberExpression" &&
          current.callee.property.name === "withConverter"
        ) {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    return {
      CallExpression(node) {
        if (isCollectionCall(node)) {
          const arg = node.arguments[0];
          if (
            arg?.type === "Literal" &&
            allowedCollections.includes(arg.value)
          ) {
            return;
          }
          if (!hasWithConverter(node)) {
            context.report({ node, messageId: "missingConverter" });
          }
        }
      },
    };
  },
};
