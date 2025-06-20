/**
 * @file Kieli grammar for tree-sitter
 * @author aattoa <aattoa@proton.me>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const separated = (separator, element) =>
  seq(element, repeat(seq(separator, element)))

const comma_separated = (element) =>
  separated(',', element)

module.exports = grammar({
  name: 'kieli',

  rules: {
    source_file: $ => repeat($.definition),

    definition: $ => choice(
      $.function_definition,
      $.struct_definition,
      $.enum_definition,
      $.alias_definition,
      $.concept_definition,
      $.impl_definition,
      $.module_definition,
    ),

    function_definition: $ => seq(
      $.function_signature,
      '=',
      $.expression,
    ),

    struct_definition: $ => seq(
      'struct',
      $.upper_id,
      optional($.template_parameters),
      optional($.constructor_body),
    ),

    enum_definition: $ => seq(
      'enum',
      $.upper_id,
      optional($.template_parameters),
      '=',
      separated('|', $.constructor_definition),
    ),

    alias_definition: $ => seq(
      'alias',
      $.upper_id,
      optional($.template_parameters),
      '=',
      $.type,
    ),

    concept_definition: $ => seq(
      'concept',
      $.upper_id,
      optional($.template_parameters),
      '{',
      repeat(choice($.function_signature, $.type_signature)),
      '}',
    ),

    impl_definition: $ => seq(
      'impl',
      optional($.template_parameters),
      $.type,
      '{',
      repeat($.definition),
      '}',
    ),

    module_definition: $ => seq(
      'module',
      $.lower_id,
      optional($.template_parameters),
      '{',
      repeat($.definition),
      '}',
    ),

    constructor_body: $ => choice(
      $.struct_constructor_body,
      $.tuple_constructor_body,
    ),

    constructor_definition: $ => seq(
      $.upper_id,
      optional($.constructor_body),
    ),

    struct_constructor_body: $ => seq(
      '{',
      comma_separated($.struct_field_definition),
      '}',
    ),

    tuple_constructor_body: $ => seq(
      '(',
      comma_separated($.type),
      ')',
    ),

    struct_field_definition: $ => seq(
      $.lower_id,
      ':',
      $.type,
    ),

    function_signature: $ => seq(
      'fn',
      $.lower_id,
      optional($.template_parameters),
      $.function_parameters,
      optional(seq(':', $.type)),
    ),

    function_parameters: $ => seq(
      '(',
      optional(comma_separated($.function_parameter)),
      ')',
    ),

    function_parameter: $ => seq(
      $.pattern,
      ':',
      $.type,
    ),

    type_signature: $ => seq(
      'alias',
      $.upper_id,
      optional(seq(':', separated('+', $.concept_path))),
    ),

    template_parameters: $ => seq(
      '[',
      comma_separated($.template_parameter),
      ']',
    ),

    template_parameter: $ => choice(
      $.template_type_parameter,
      $.template_mutability_parameter,
    ),

    template_type_parameter: $ => seq(
      $.upper_id,
      optional(seq(':', separated('+', $.concept_path))),
    ),

    template_mutability_parameter: $ => seq(
      $.lower_id,
      ':',
      'mut',
    ),

    template_arguments: $ => seq(
      '[',
      comma_separated($.template_argument),
      ']',
    ),

    template_argument: $ => choice(
      $.type,
      $.mutability,
      prec(1, $.wildcard),
    ),

    type: $ => $.wildcard,

    expression: $ => choice(
      $.wildcard,
      $.int_literal,
      $.float_literal,
      $.bool_literal,
      $.string_literal,
    ),

    pattern: $ => choice(
      $.wildcard,
      $.int_literal,
      $.float_literal,
      $.bool_literal,
      $.string_literal,
    ),

    mutability: $ => choice(
      'immut',
      seq('mut', optional(seq('?', $.lower_id))),
    ),

    concept_path: $ => $.path,

    path: $ => $.any_id,

    int_literal: $ => /[0-9][a-zA-Z0-9']*/,
    float_literal: $ => /[0-9][a-zA-Z0-9']*\.[a-zA-Z0-9']*/,
    bool_literal: $ => choice('true', 'false'),

    string_escape: $ => /\\./,
    string_literal: $ => repeat1(seq('"', repeat(choice($.string_escape, /[^\\]/)), '"')),

    wildcard: $ => /_+/,
    lower_id: $ => /_*[a-z][a-zA-Z0-9_']*/,
    upper_id: $ => /_*[A-Z][a-zA-Z0-9_']*/,
    any_id: $ => /_*[a-zA-Z][a-zA-Z0-9_']*/,
  }
});
