/**
 * @file Kieli grammar for tree-sitter
 * @author aattoa <aattoa@proton.me>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "kieli",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
