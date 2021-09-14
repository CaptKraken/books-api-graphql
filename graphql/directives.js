import { defaultFieldResolver } from "graphql";

const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");

export function isCurrentUserDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    // Executes once for each object field in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // Check whether this field has the specified directive
      const isCurrentUserDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];

      if (isCurrentUserDirective) {
        // Get this field's original resolver
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          if (!context.user) throw new Error("unauthorized");
          const result = await resolve(source, args, context, info);

          if (context.user.userid !== result.id)
            throw new Error("unauthorized");
          return result;
        };
        return fieldConfig;
      }
    },
  });
}
export function isAuthenticated(schema, directiveName) {
  console.log("auth");
  return mapSchema(schema, {
    // Executes once for each object field in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // Check whether this field has the specified directive
      const isAuthenticatedDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];
      if (isAuthenticatedDirective) {
        // Get this field's original resolver
        const { resolve = defaultFieldResolver } = fieldConfig;
        console.log(fieldConfig.resolve);
        fieldConfig.resolve = async function (source, args, context, info) {
          if (!context.user || Object.keys(context.user).length === 0) {
            throw new Error(
              `auth unauthorized. you have to be logged in to perform this action.`
            );
          }
          const result = await resolve(source, args, context, info);
          return result;
        };
        return fieldConfig;
      }
    },
  });
}
export function permission(schema, directiveName) {
  return mapSchema(schema, {
    // Executes once for each object field in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // Check whether this field has the specified directive
      const permissionDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];

      if (permissionDirective) {
        // Get this field's original resolver
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          console.log("hi");
          // if (!context?.user)
          //   throw new Error(
          //     `unauthorized. you have to be logged in to perform that action.`
          //   );

          if (
            permissionDirective.role !== context?.user?.role &&
            context?.user?.role !== "admin"
          ) {
            throw new Error(
              `unauthorized. you have to be ${
                permissionDirective.role !== "admin"
                  ? `an ${permissionDirective.role} or admin`
                  : "an admin"
              } to perform that action.`
            );
          }
          const result = await resolve(source, args, context, info);
          return result;
        };
        return fieldConfig;
      }
    },
  });
}
