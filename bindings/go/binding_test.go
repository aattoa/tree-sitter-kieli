package tree_sitter_kieli_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_kieli "github.com/aattoa/tree-sitter-kieli/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_kieli.Language())
	if language == nil {
		t.Errorf("Error loading Kieli grammar")
	}
}
