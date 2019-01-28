module.exports = {
  "extends": "airbnb-base",
  "plugins": [
      "import",
      "jest",
  ],
  "env": {
    "jest": true,
  },
  "rules":{
    "max-len": 0,
    "global-require": 0,
    'arrow-parens': ['error', 'as-needed', {
      requireForBlockBody: false,
    }],
    "no-param-reassign": ["error", { "props": false }],
    "one-var": 0,
    "no-useless-escape": 0,
    "no-underscore-dangle": ["error", { "allow": ["_id"] }],
    "no-bitwise" : ["error", {"allow": ["&"]}],
  },
};
