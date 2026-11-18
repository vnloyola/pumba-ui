/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["**/node_modules/**", "**/dist/**", "**/storybook-static/**", "**/coverage/**"],
  overrides: [
    {
      files: ["packages/ui/src/**/*.css"],
      rules: {
        "declaration-property-value-disallowed-list": [
          { "/.*/": ["/--pumba-primitive-/"] },
          {
            message:
              "Components use semantic tokens (--pumba-*), never primitives (--pumba-primitive-*)",
          },
        ],
      },
    },
  ],
};
