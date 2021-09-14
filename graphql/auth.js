export const authenticated = (next) => (root, args, context, info) => {
  if (!context.user) {
    throw new Error("not authorized");
  }

  return next(root, args, context, info);
};
