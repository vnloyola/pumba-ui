import StyleDictionary from "style-dictionary";

const PREFIX = "pumba";

const kebab = (path) => [PREFIX, ...path].join("-");
const isPrimitive = (token) => token.path[0] === "primitive";
const isSemantic = (token) => !isPrimitive(token);

const toVar = (value) =>
  typeof value === "string"
    ? value.replace(/\{([^}]+)\}/g, (_, path) => `var(--${kebab(path.split("."))})`)
    : String(value);

const declaration = (name, value) => `  --${name}: ${value};`;

const semanticDeclarations = (token) => {
  const name = kebab(token.path);
  const { $value, $type, $extensions } = token.original;

  if ($extensions?.mode) {
    const { light, dark } = $extensions.mode;
    return [declaration(name, `light-dark(${toVar(light)}, ${toVar(dark)})`)];
  }
  if ($type === "typography") {
    return Object.entries($value).map(([property, value]) =>
      declaration(
        `${name}-${property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`,
        toVar(value),
      ),
    );
  }
  return [declaration(name, toVar($value))];
};

const indent = (lines) => lines.map((line) => `  ${line}`).join("\n");

const themeRules = `[data-theme="light"] {
  color-scheme: light;
  color: var(--pumba-color-text);
}

[data-theme="dark"] {
  color-scheme: dark;
  color: var(--pumba-color-text);
}`;

StyleDictionary.registerFormat({
  name: "pumba/css",
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens;
    const primitives = tokens
      .filter(isPrimitive)
      .map((token) => declaration(kebab(token.path), token.$value));
    const semantic = tokens.filter(isSemantic).flatMap(semanticDeclarations);

    return `@layer pumba.tokens {\n${indent([
      ":root {",
      "  color-scheme: light dark;",
      "",
      ...primitives,
      "",
      ...semantic,
      "}",
      "",
      ...themeRules.split("\n"),
    ])}\n}\n`;
  },
});

const tokenNames = (dictionary, filter) =>
  dictionary.allTokens
    .filter(filter)
    .flatMap((token) =>
      token.original.$type === "typography"
        ? Object.keys(token.original.$value).map(
            (property) =>
              `${kebab(token.path)}-${property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`,
          )
        : [kebab(token.path)],
    );

const groups = [
  { exportName: "primitives", typeName: "PrimitiveTokenName", filter: isPrimitive },
  { exportName: "tokens", typeName: "TokenName", filter: isSemantic },
];

StyleDictionary.registerFormat({
  name: "pumba/ts-module",
  format: ({ dictionary }) =>
    [
      ...groups.flatMap(({ exportName, filter }) => [
        `export const ${exportName} = {`,
        ...tokenNames(dictionary, filter).map(
          (name) => `  ${JSON.stringify(name)}: ${JSON.stringify(`var(--${name})`)},`,
        ),
        "};",
        "",
      ]),
    ].join("\n"),
});

StyleDictionary.registerFormat({
  name: "pumba/ts-declarations",
  format: ({ dictionary }) =>
    [
      ...groups.flatMap(({ exportName, typeName, filter }) => [
        `export type ${typeName} =`,
        ...tokenNames(dictionary, filter).map((name) => `  | ${JSON.stringify(name)}`),
        ";",
        "",
        `export declare const ${exportName}: Readonly<Record<${typeName}, string>>;`,
        "",
      ]),
    ].join("\n"),
});

const transforms = StyleDictionary.hooks.transformGroups.css.filter(
  (transform) => transform !== "typography/css/shorthand",
);

const sd = new StyleDictionary({
  source: ["src/**/*.json"],
  platforms: {
    css: {
      transforms,
      buildPath: "dist/",
      files: [{ destination: "tokens.css", format: "pumba/css" }],
    },
    ts: {
      transforms,
      buildPath: "dist/",
      files: [
        { destination: "index.js", format: "pumba/ts-module" },
        { destination: "index.d.ts", format: "pumba/ts-declarations" },
      ],
    },
  },
});

await sd.buildAllPlatforms();
