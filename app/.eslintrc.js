module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 11
  },
  rules: {
    'object-curly-spacing': 0
  }
}
