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

  extras: $ => [/\s+/, $.comment_line, $.comment_multiline],

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

    expression: $ => choice(
      $.wildcard,
      $.int_literal,
      $.float_literal,
      $.bool_literal,
      $.string_literal,
    ),

    type_tuple: $ => seq('(', optional(comma_separated($.type)), ')'),
    type_never: $ => '!',
    type_array: $ => seq('[', $.type, optional(seq(';', $.expression)), ']'),
    type_function: $ => seq('fn', '(', optional(comma_separated($.type)), ')', ':', $.type),
    type_typeof: $ => seq('typeof', '(', $.expression, ')'),
    type_impl: $ => seq('impl', separated('+', $.concept_path)),
    type_reference: $ => seq('&', optional($.mutability), $.type),
    type_pointer: $ => seq('*', optional($.mutability), $.type),

    type: $ => choice(
      $.wildcard,
      $.path,
      $.type_tuple,
      $.type_never,
      $.type_array,
      $.type_function,
      $.type_typeof,
      $.type_impl,
      $.type_reference,
      $.type_pointer,
    ),

    pattern_name: $ => seq($.mutability, $.lower_id),
    pattern_tuple: $ => seq('(', optional(comma_separated($.pattern)), ')'),
    pattern_slice: $ => seq('[', optional(comma_separated($.pattern)), ']'),
    pattern_guarded: $ => seq($.pattern, 'if', $.expression),
    pattern_path_tuple: $ => seq('(', optional(comma_separated($.pattern)), ')'),
    pattern_path_field: $ => seq($.lower_id, optional(seq('=', $.pattern))),
    pattern_path_struct: $ => seq('{', comma_separated($.pattern_path_field), '}'),
    pattern_path_body: $ => choice($.pattern_path_tuple, $.pattern_path_struct),
    pattern_path: $ => seq($.path, optional($.pattern_path_body)),

    pattern: $ => choice(
      $.wildcard,
      $.int_literal,
      $.float_literal,
      $.bool_literal,
      $.string_literal,
      $.pattern_tuple,
      $.pattern_slice,
      $.pattern_guarded,
      $.pattern_name,
      $.pattern_path,
    ),

    mutability: $ => choice(
      'immut',
      seq('mut', optional(seq('?', $.lower_id))),
    ),

    concept_path: $ => $.path,

    path_segment: $ => seq($.any_id, optional($.template_arguments)),
    path: $ => separated('::', $.path_segment),

    string_escape: $ => /\\./,
    string_literal: $ => repeat1(seq('"', repeat(choice($.string_escape, /[^\\]/)), '"')),

    int_literal: $ => /[0-9][a-zA-Z0-9']*/,
    float_literal: $ => /[0-9][a-zA-Z0-9']*\.[a-zA-Z0-9']*/,
    bool_literal: $ => choice('true', 'false'),

    wildcard: $ => /_+/,
    lower_id: $ => /_*[a-z][a-zA-Z0-9_']*/,
    upper_id: $ => /_*[A-Z][a-zA-Z0-9_']*/,
    any_id: $ => /_*[a-zA-Z][a-zA-Z0-9_']*/,

    comment_line: $ => seq('//', /[^\n]*/),
    comment_multiline: $ => seq('/*', repeat(choice(/\*[^/]/, /[^\*]/)), '*/'),
  }
});
