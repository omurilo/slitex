package compiler

import (
	"strings"
)

type Node interface{}

type Presentation struct {
	Title  string  `json:"title"`
	Author string  `json:"author"`
	Date   string  `json:"date"`
	Theme  string  `json:"theme"` // Novo campo para rastrear o tema escolhido
	Frames []Frame `json:"frames"`
}

type Frame struct {
	Title    string    `json:"title"`
	Subtitle string    `json:"subtitle"`
	Content  []Content `json:"content"`
}

type ContentType string

const (
	ContentRichText ContentType = "richtext"
	ContentBlock    ContentType = "block"
	ContentList     ContentType = "list"
	ContentColumns  ContentType = "columns"
	ContentColumn   ContentType = "column"
	ContentImage    ContentType = "image"
)

type InlineType string

const (
	InlinePureText InlineType = "text"
	InlineBold     InlineType = "bold"
	InlineItalic   InlineType = "italic"
	InlineMathMode InlineType = "math"
)

type InlineContent struct {
	Type    InlineType `json:"type"`
	Value   string     `json:"value"`
	Overlay string     `json:"overlay,omitempty"` // Especificação de clique ex: "2" ou "1-"
}

type Content struct {
	Type     ContentType     `json:"type"`
	Inline   []InlineContent `json:"inline,omitempty"`
	Title    string          `json:"title,omitempty"`
	Width    string          `json:"width,omitempty"`   // Especifico para Column
	Path     string          `json:"path,omitempty"`    // Especifico para Image
	Overlay  string          `json:"overlay,omitempty"` // Aplica-se a blocos, colunas e listas
	Children []Content       `json:"children,omitempty"`
	Ordered  bool            `json:"ordered,omitempty"`
}

type Parser struct {
	l         *Lexer
	curToken  Token
	peekToken Token
}

func NewParser(l *Lexer) *Parser {
	p := &Parser{l: l}
	p.nextToken()
	p.nextToken()
	return p
}

func (p *Parser) nextToken() {
	p.curToken = p.peekToken
	p.peekToken = p.l.NextToken()
}

func (p *Parser) ParsePresentation() (*Presentation, error) {
	pres := &Presentation{Frames: []Frame{}, Theme: "default"} // "default" como fallback

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand {
			switch p.curToken.Value {
			case "title":
				pres.Title = p.parseRawArgument()
			case "author":
				pres.Author = p.parseRawArgument()
			case "date":
				pres.Date = p.parseRawArgument()
			case "usetheme":
				// Intercepta \usetheme{Metropolis}
				pres.Theme = strings.ToLower(p.parseRawArgument())
			case "begin":
				arg := p.parseRawArgument()
				if arg == "frame" {
					frame, err := p.parseFrame()
					if err != nil {
						return nil, err
					}
					pres.Frames = append(pres.Frames, frame)
				}
			default:
				p.skipUnknownCommand()
			}
		} else {
			p.nextToken()
		}
	}

	return pres, nil
}

func (p *Parser) parseRawArgument() string {
	if p.curToken.Type == TokenCommand {
		p.nextToken()
	}
	if p.curToken.Type != TokenOpenBrace {
		return ""
	}
	p.nextToken()

	var val strings.Builder
	for p.curToken.Type != TokenCloseBrace && p.curToken.Type != TokenEOF {
		val.WriteString(p.curToken.Value)
		p.nextToken()
	}
	p.nextToken()
	return strings.TrimSpace(val.String())
}

func (p *Parser) parseOverlaySpecification() string {
	if p.curToken.Type != TokenLessThan {
		return ""
	}
	p.nextToken() // Consome '<'

	var overlay strings.Builder
	for p.curToken.Type != TokenGreaterThan && p.curToken.Type != TokenEOF {
		overlay.WriteString(p.curToken.Value)
		p.nextToken()
	}
	p.nextToken() // Consome '>'
	return overlay.String()
}

func (p *Parser) skipUnknownCommand() {
	p.nextToken()
	for p.curToken.Type == TokenOpenBracket {
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			p.nextToken()
		}
		p.nextToken()
	}
	for p.curToken.Type == TokenOpenBrace {
		for p.curToken.Type != TokenCloseBrace && p.curToken.Type != TokenEOF {
			p.nextToken()
		}
		p.nextToken()
	}
}

func (p *Parser) parseFrame() (Frame, error) {
	var frame Frame

	if p.curToken.Type == TokenOpenBrace {
		frame.Title = p.parseRawArgument()
	}
	if p.curToken.Type == TokenOpenBrace {
		frame.Subtitle = p.parseRawArgument()
	}

	frame.Content = []Content{}

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand && p.curToken.Value == "end" {
			arg := p.parseRawArgument()
			if arg == "frame" {
				break
			}
		}

		content, err := p.parseContent()
		if err != nil {
			return frame, err
		}
		if content != nil {
			frame.Content = append(frame.Content, *content)
		}
	}

	return frame, nil
}

func (p *Parser) parseContent() (*Content, error) {
	if p.curToken.Type == TokenCommand {
		switch p.curToken.Value {
		case "begin":
			env := p.parseRawArgument()
			if env == "block" {
				return p.parseBlock()
			}
			if env == "columns" {
				return p.parseColumns()
			}
			if env == "column" {
				return p.parseColumn()
			}
			if env == "itemize" || env == "enumerate" {
				return p.parseSliceList(env)
			}
		case "includegraphics":
			return p.parseImage(), nil
		case "end":
			return nil, nil
		}
	}

	inlineElements := p.parseInlineTokens(func() bool {
		if p.curToken.Type == TokenEOF {
			return true
		}
		if p.curToken.Type == TokenCommand {
			return p.curToken.Value == "begin" || p.curToken.Value == "end" || p.curToken.Value == "item" || p.curToken.Value == "includegraphics"
		}
		return false
	})

	if len(inlineElements) == 0 {
		return nil, nil
	}

	return &Content{Type: ContentRichText, Inline: inlineElements}, nil
}

func (p *Parser) parseInlineTokens(stopCondition func() bool) []InlineContent {
	var elements []InlineContent

	for !stopCondition() {
		switch p.curToken.Type {
		case TokenText:
			text := p.curToken.Value
			p.nextToken()
			if strings.TrimSpace(text) != "" {
				elements = append(elements, InlineContent{Type: InlinePureText, Value: text})
			}
		case TokenMath:
			val := p.curToken.Value
			p.nextToken()
			elements = append(elements, InlineContent{Type: InlineMathMode, Value: val})
		case TokenCommand:
			cmd := p.curToken.Value
			p.nextToken() // Consome o identificador do comando

			// Captura overlay se houver logo após a macro (ex: \textbf<2>{...})
			overlay := p.parseOverlaySpecification()

			if cmd == "textbf" {
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineBold, Value: arg, Overlay: overlay})
			} else if cmd == "textit" {
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineItalic, Value: arg, Overlay: overlay})
			} else {
				// Fallback caso seja um comando desconhecido dentro do bloco de texto
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "\\" + cmd})
			}
		default:
			p.nextToken()
		}
	}

	return elements
}

func (p *Parser) parseBlock() (*Content, error) {
	block := &Content{Type: ContentBlock, Children: []Content{}}

	// Ex: \begin{block}<2->{Título}
	block.Overlay = p.parseOverlaySpecification()

	if p.curToken.Type == TokenOpenBrace {
		block.Title = p.parseRawArgument()
	}

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand && p.curToken.Value == "end" {
			arg := p.parseRawArgument()
			if arg == "block" {
				break
			}
		}
		content, err := p.parseContent()
		if err != nil {
			return nil, err
		}
		if content != nil {
			block.Children = append(block.Children, *content)
		}
	}
	return block, nil
}

func (p *Parser) parseColumns() (*Content, error) {
	columns := &Content{Type: ContentColumns, Children: []Content{}}

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand && p.curToken.Value == "end" {
			arg := p.parseRawArgument()
			if arg == "columns" {
				break
			}
		}
		content, err := p.parseContent()
		if err != nil {
			return nil, err
		}
		if content != nil {
			columns.Children = append(columns.Children, *content)
		}
	}
	return columns, nil
}

func (p *Parser) parseColumn() (*Content, error) {
	column := &Content{Type: ContentColumn, Children: []Content{}}

	column.Overlay = p.parseOverlaySpecification()

	if p.curToken.Type == TokenOpenBrace {
		column.Width = p.parseRawArgument()
	}

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand && p.curToken.Value == "end" {
			arg := p.parseRawArgument()
			if arg == "column" {
				break
			}
		}
		content, err := p.parseContent()
		if err != nil {
			return nil, err
		}
		if content != nil {
			column.Children = append(column.Children, *content)
		}
	}
	return column, nil
}

func (p *Parser) parseImage() *Content {
	// Consome \includegraphics
	p.nextToken()

	// Se tiver opções [width=...], pula ou armazena por enquanto
	if p.curToken.Type == TokenOpenBracket {
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			p.nextToken()
		}
		p.nextToken() // Consome ']'
	}

	path := ""
	if p.curToken.Type == TokenOpenBrace {
		path = p.parseRawArgument()
	}

	return &Content{Type: ContentImage, Path: path}
}

func (p *Parser) parseSliceList(listType string) (*Content, error) {
	list := &Content{
		Type:     ContentList,
		Ordered:  listType == "enumerate",
		Children: []Content{},
	}

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand {
			if p.curToken.Value == "end" {
				arg := p.parseRawArgument()
				if arg == listType {
					break
				}
			}
			if p.curToken.Value == "item" {
				p.nextToken() // Consome \item

				// Captura overlay do item ex: \item<1->
				itemOverlay := p.parseOverlaySpecification()

				inlineElements := p.parseInlineTokens(func() bool {
					return p.curToken.Type == TokenEOF ||
						(p.curToken.Type == TokenCommand && (p.curToken.Value == "item" || p.curToken.Value == "end"))
				})

				list.Children = append(list.Children, Content{
					Type:    ContentRichText,
					Overlay: itemOverlay,
					Inline:  inlineElements,
				})
				continue
			}
		}
		p.nextToken()
	}

	return list, nil
}
