package compiler

import (
	"strings"
	"unicode"
)

type TokenType string

const (
	TokenError        TokenType = "ERROR"
	TokenEOF          TokenType = "EOF"
	TokenCommand      TokenType = "COMMAND"       // \title, \begin, \includegraphics
	TokenOpenBrace    TokenType = "OPEN_BRACE"    // {
	TokenCloseBrace   TokenType = "CLOSE_BRACE"   // }
	TokenOpenBracket  TokenType = "OPEN_BRACKET"  // [
	TokenCloseBracket TokenType = "CLOSE_BRACKET" // ]
	TokenLessThan     TokenType = "LESS_THAN"     // < (para overlays)
	TokenGreaterThan  TokenType = "GREATER_THAN"  // > (para overlays)
	TokenMath         TokenType = "MATH"          // $...$ ou \[...\]
	TokenText         TokenType = "TEXT"          // Texto puro
)

type Token struct {
	Type  TokenType
	Value string
	Line  int
}

type Lexer struct {
	input        string
	position     int
	readPosition int
	ch           byte
	line         int
}

func NewLexer(input string) *Lexer {
	l := &Lexer{input: input, line: 1}
	l.readChar()
	return l
}

func (l *Lexer) readChar() {
	if l.readPosition >= len(l.input) {
		l.ch = 0
	} else {
		l.ch = l.input[l.readPosition]
	}
	l.position = l.readPosition
	l.readPosition++
}

func (l *Lexer) NextToken() Token {
	l.skipWhitespace()
	// Skip LaTeX line comments: % until end of line
	for l.ch == '%' {
		for l.ch != '\n' && l.ch != 0 {
			l.readChar()
		}
		l.skipWhitespace()
	}

	var tok Token
	tok.Line = l.line

	switch l.ch {
	case 0:
		tok.Type = TokenEOF
		tok.Value = ""
	case '{':
		tok.Type = TokenOpenBrace
		tok.Value = "{"
		l.readChar()
	case '}':
		tok.Type = TokenCloseBrace
		tok.Value = "}"
		l.readChar()
	case '[':
		tok.Type = TokenOpenBracket
		tok.Value = "["
		l.readChar()
	case ']':
		tok.Type = TokenCloseBracket
		tok.Value = "]"
		l.readChar()
	case '<':
		tok.Type = TokenLessThan
		tok.Value = "<"
		l.readChar()
	case '>':
		tok.Type = TokenGreaterThan
		tok.Value = ">"
		l.readChar()
	case '$':
		tok.Type = TokenMath
		tok.Value = l.readInlineMath()
	case '\\':
		l.readChar()
		if l.ch == '[' {
			tok.Type = TokenMath
			tok.Value = l.readBlockMath()
			return tok
		}
		if l.ch == '\\' {
			tok.Type = TokenCommand
			tok.Value = `\\`
			l.readChar()
			return tok
		}
		tok.Type = TokenCommand
		tok.Value = l.readIdentifier()
	default:
		tok.Type = TokenText
		tok.Value = l.readText()
	}

	return tok
}

func (l *Lexer) readIdentifier() string {
	position := l.position
	for isLetter(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) readInlineMath() string {
	l.readChar()
	position := l.position
	for l.ch != '$' && l.ch != 0 {
		if l.ch == '\n' {
			l.line++
		}
		l.readChar()
	}
	val := l.input[position:l.position]
	if l.ch == '$' {
		l.readChar()
	}
	return val
}

func (l *Lexer) readBlockMath() string {
	l.readChar()
	position := l.position
	for l.ch != 0 {
		if l.ch == '\\' && l.readPosition < len(l.input) && l.input[l.readPosition] == ']' {
			val := l.input[position:l.position]
			l.readChar()
			l.readChar()
			return val
		}
		if l.ch == '\n' {
			l.line++
		}
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) readText() string {
	position := l.position
	for l.ch != 0 && l.ch != '\\' && l.ch != '{' && l.ch != '}' && l.ch != '[' && l.ch != ']' && l.ch != '$' && l.ch != '<' && l.ch != '>' && l.ch != '%' {
		if l.ch == '\n' {
			l.line++
		}
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) skipWhitespace() {
	for l.ch == ' ' || l.ch == '\t' || l.ch == '\r' || l.ch == '\n' {
		if l.ch == '\n' {
			l.line++
		}
		l.readChar()
	}
}

func isLetter(ch byte) bool {
	return unicode.IsLetter(rune(ch))
}

// ReadRawUntil reads raw text until endMarker is found,
// returning content before the marker and advancing past it.
func (l *Lexer) ReadRawUntil(endMarker string) string {
	var sb strings.Builder
	for l.ch != 0 {
		if strings.HasPrefix(l.input[l.position:], endMarker) {
			for range endMarker {
				l.readChar()
			}
			return sb.String()
		}
		if l.ch == '\n' {
			l.line++
		}
		sb.WriteByte(l.ch)
		l.readChar()
	}
	return sb.String()
}
