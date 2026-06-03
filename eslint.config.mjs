// Minimal flat config. Next 16's eslint-config-next causes a circular-JSON
// error when loaded via FlatCompat; type-checking and Next build lint suffice.
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "prisma/generated/**",
      "generated/**",
      "scripts/**",
      "public/**",
      "docs/**",
      ".omc/**",
    ],
  },
];
