const cardId = /\b[A-Z]{2,}-\d+\b/;

export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "subject-no-card-id": ({ subject }) => [
          !cardId.test(subject ?? ""),
          "the subject must not contain a card id",
        ],
      },
    },
  ],
  rules: {
    "subject-no-card-id": [2, "always"],
  },
};
