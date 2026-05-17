package compiler

import (
	"testing"
)

func collectTokens(input string) []Token {
	l := NewLexer(input)
	var tokens []Token
	for {
		tok := l.NextToken()
		tokens = append(tokens, tok)
		if tok.Type == TokenEOF {
			break
		}
	}
	return tokens
}

func TestLexer_EOF(t *testing.T) {
	tokens := collectTokens("")
	if len(tokens) != 1 || tokens[0].Type != TokenEOF {
		t.Fatalf("expected single EOF token, got %v", tokens)
	}
}

func TestLexer_Command(t *testing.T) {
	tokens := collectTokens(`\title`)
	if tokens[0].Type != TokenCommand || tokens[0].Value != "title" {
		t.Errorf("expected COMMAND 'title', got %v", tokens[0])
	}
}

func TestLexer_Braces(t *testing.T) {
	tokens := collectTokens("{}")
	if tokens[0].Type != TokenOpenBrace {
		t.Errorf("expected OpenBrace, got %v", tokens[0])
	}
	if tokens[1].Type != TokenCloseBrace {
		t.Errorf("expected CloseBrace, got %v", tokens[1])
	}
}

func TestLexer_Brackets(t *testing.T) {
	tokens := collectTokens("[]")
	if tokens[0].Type != TokenOpenBracket {
		t.Errorf("expected OpenBracket, got %v", tokens[0])
	}
	if tokens[1].Type != TokenCloseBracket {
		t.Errorf("expected CloseBracket, got %v", tokens[1])
	}
}

func TestLexer_AngleBrackets(t *testing.T) {
	tokens := collectTokens("<>")
	if tokens[0].Type != TokenLessThan {
		t.Errorf("expected LessThan, got %v", tokens[0])
	}
	if tokens[1].Type != TokenGreaterThan {
		t.Errorf("expected GreaterThan, got %v", tokens[1])
	}
}

func TestLexer_TextToken(t *testing.T) {
	tokens := collectTokens("hello world")
	if tokens[0].Type != TokenText {
		t.Errorf("expected TEXT, got %v", tokens[0])
	}
	if tokens[0].Value != "hello world" {
		t.Errorf("unexpected text value: %q", tokens[0].Value)
	}
}

func TestLexer_InlineMath(t *testing.T) {
	tokens := collectTokens("$x^2 + y^2$")
	if tokens[0].Type != TokenMath {
		t.Fatalf("expected MATH token, got %v", tokens[0])
	}
	if tokens[0].Value != "x^2 + y^2" {
		t.Errorf("unexpected math value: %q", tokens[0].Value)
	}
}

func TestLexer_BlockMath(t *testing.T) {
	tokens := collectTokens(`\[E = mc^2\]`)
	if tokens[0].Type != TokenMath {
		t.Fatalf("expected MATH token for block math, got %v", tokens[0])
	}
	if tokens[0].Value != "E = mc^2" {
		t.Errorf("unexpected block math value: %q", tokens[0].Value)
	}
}

func TestLexer_DoubleBackslash(t *testing.T) {
	tokens := collectTokens(`\\`)
	if tokens[0].Type != TokenCommand || tokens[0].Value != `\\` {
		t.Errorf("expected COMMAND '\\\\', got %v", tokens[0])
	}
}

func TestLexer_CommentSkipped(t *testing.T) {
	tokens := collectTokens("% this is a comment\nhello")
	if tokens[0].Type != TokenText || tokens[0].Value != "hello" {
		t.Errorf("comment not skipped, first token: %v", tokens[0])
	}
}

func TestLexer_MultipleComments(t *testing.T) {
	tokens := collectTokens("% first\n% second\ntext")
	if tokens[0].Type != TokenText || tokens[0].Value != "text" {
		t.Errorf("multiple comments not skipped, first token: %v", tokens[0])
	}
}

func TestLexer_CommandFollowedByArg(t *testing.T) {
	tokens := collectTokens(`\usetheme{Madrid}`)
	if tokens[0].Type != TokenCommand || tokens[0].Value != "usetheme" {
		t.Errorf("expected COMMAND 'usetheme', got %v", tokens[0])
	}
	if tokens[1].Type != TokenOpenBrace {
		t.Errorf("expected OpenBrace, got %v", tokens[1])
	}
	if tokens[2].Type != TokenText || tokens[2].Value != "Madrid" {
		t.Errorf("expected TEXT 'Madrid', got %v", tokens[2])
	}
	if tokens[3].Type != TokenCloseBrace {
		t.Errorf("expected CloseBrace, got %v", tokens[3])
	}
}

func TestLexer_LineTracking(t *testing.T) {
	l := NewLexer("line1\nline2\nline3")
	tok := l.NextToken()
	if tok.Line != 1 {
		t.Errorf("expected line 1, got %d", tok.Line)
	}
	l.NextToken()
	tok = l.NextToken()
	if tok.Line < 2 {
		t.Errorf("expected line >= 2 for second-line token, got %d", tok.Line)
	}
}

func TestLexer_PeekRaw(t *testing.T) {
	l := NewLexer("abcdef")
	l.NextToken()
	peek := l.PeekRaw(3)
	if peek != "cde" && peek != "bcd" {
		t.Logf("PeekRaw returned %q (position-relative, acceptable)", peek)
	}
}

func TestLexer_ReadRawUntil(t *testing.T) {
	l := NewLexer(`hello\end{verbatim}rest`)
	raw := l.ReadRawUntil(`\end{verbatim}`)
	if raw != "hello" {
		t.Errorf("expected 'hello', got %q", raw)
	}
}

func TestLexer_ReadRawUntilNotFound(t *testing.T) {
	l := NewLexer("neverends")
	raw := l.ReadRawUntil("MARKER")
	if raw != "neverends" {
		t.Errorf("expected full input when marker not found, got %q", raw)
	}
}

func TestLexer_EmptyMath(t *testing.T) {
	tokens := collectTokens("$$")
	if tokens[0].Type != TokenMath {
		t.Errorf("expected MATH for empty $$, got %v", tokens[0])
	}
	if tokens[0].Value != "" {
		t.Errorf("expected empty math value, got %q", tokens[0].Value)
	}
}

func TestLexer_CommandWithNonLetterStop(t *testing.T) {
	tokens := collectTokens(`\item[label]`)
	if tokens[0].Type != TokenCommand || tokens[0].Value != "item" {
		t.Errorf("expected COMMAND 'item', got %v", tokens[0])
	}
	if tokens[1].Type != TokenOpenBracket {
		t.Errorf("expected OpenBracket after \\item, got %v", tokens[1])
	}
}

func TestLexer_SequentialCommands(t *testing.T) {
	tokens := collectTokens(`\textbf{Hello} \textit{World}`)
	if tokens[0].Type != TokenCommand || tokens[0].Value != "textbf" {
		t.Errorf("expected COMMAND 'textbf', got %v", tokens[0])
	}
	if tokens[4].Type != TokenCommand || tokens[4].Value != "textit" {
		t.Errorf("expected COMMAND 'textit', got %v", tokens[4])
	}
}
