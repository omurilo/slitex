package compiler

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Node interface{}

type Section struct {
	Title      string `json:"title"`
	SlideIndex int    `json:"slideIndex"`
}

type Presentation struct {
	Title        string        `json:"title"`
	Author       string        `json:"author"`
	Institute    string        `json:"institute,omitempty"`
	Date         string        `json:"date,omitempty"`
	Theme        string        `json:"theme"`
	Language     string        `json:"language,omitempty"`
	Packages     []string      `json:"packages,omitempty"`
	Sections     []Section     `json:"sections"`
	Frames       []Frame       `json:"frames"`
	BibResources []string      `json:"bibResources,omitempty"`
	Citations    []CitationRef `json:"citations,omitempty"`
	Bibliography []BibEntry    `json:"bibliography,omitempty"`
}

type Frame struct {
	Title     string    `json:"title"`
	Subtitle  string    `json:"subtitle"`
	Notes     string    `json:"notes"`
	MaxSteps  int       `json:"maxSteps"`
	Section   string    `json:"section,omitempty"`
	TitlePage bool      `json:"titlePage,omitempty"`
	Plain     bool      `json:"plain,omitempty"`
	Content   []Content `json:"content"`
}

type ContentType string

const (
	ContentRichText     ContentType = "richtext"
	ContentBlock        ContentType = "block"
	ContentList         ContentType = "list"
	ContentColumns      ContentType = "columns"
	ContentColumn       ContentType = "column"
	ContentImage        ContentType = "image"
	ContentVerbatim     ContentType = "verbatim"
	ContentCode         ContentType = "code"
	ContentTable        ContentType = "table"
	ContentTableRow     ContentType = "tablerow"
	ContentTOC          ContentType = "toc"
	ContentSpacer       ContentType = "spacer"
	ContentQuote        ContentType = "quote"
	ContentBibliography ContentType = "bibliography"
)

type InlineType string

const (
	InlinePureText InlineType = "text"
	InlineBold     InlineType = "bold"
	InlineItalic   InlineType = "italic"
	InlineMathMode InlineType = "math"
	InlineAlert    InlineType = "alert"
	InlineColored  InlineType = "colored"
	InlineCitation InlineType = "citation"
	InlineURL      InlineType = "url"
)

type InlineContent struct {
	Type    InlineType `json:"type"`
	Value   string     `json:"value"`
	Color   string     `json:"color,omitempty"`
	Overlay string     `json:"overlay,omitempty"`
}

type Content struct {
	Type     ContentType     `json:"type"`
	Inline   []InlineContent `json:"inline,omitempty"`
	Title    string          `json:"title,omitempty"`
	Width    string          `json:"width,omitempty"`
	Path     string          `json:"path,omitempty"`
	Lang     string          `json:"lang,omitempty"`
	Overlay  string          `json:"overlay,omitempty"`
	Children []Content       `json:"children,omitempty"`
	Ordered  bool            `json:"ordered,omitempty"`
}

type Parser struct {
	l             *Lexer
	lexerStack    []lexerFrame
	baseDir       string
	curToken      Token
	peekToken     Token
	citationIndex int
	citationMap   map[string]int
	citationKeys  []string
}

type lexerFrame struct {
	l         *Lexer
	curToken  Token
	peekToken Token
}

func NewParser(l *Lexer, baseDir string) *Parser {
	p := &Parser{l: l, baseDir: baseDir, citationMap: make(map[string]int)}
	p.nextToken()
	p.nextToken()
	return p
}

func (p *Parser) nextToken() {
	p.curToken = p.peekToken
	// When an included file ends, pop back to the parent lexer
	if p.curToken.Type == TokenEOF && len(p.lexerStack) > 0 {
		frame := p.lexerStack[len(p.lexerStack)-1]
		p.lexerStack = p.lexerStack[:len(p.lexerStack)-1]
		p.l = frame.l
		p.curToken = frame.curToken
		p.peekToken = frame.peekToken
		return
	}
	p.peekToken = p.l.NextToken()
}

func (p *Parser) citationRef(key string) string {
	if n, ok := p.citationMap[key]; ok {
		return strconv.Itoa(n)
	}
	p.citationIndex++
	p.citationMap[key] = p.citationIndex
	p.citationKeys = append(p.citationKeys, key)
	return strconv.Itoa(p.citationIndex)
}

// formatDate formats a time according to the presentation language.
func formatDate(t time.Time, lang string) string {
	if lang == "pt-BR" {
		months := []string{
			"janeiro", "fevereiro", "março", "abril", "maio", "junho",
			"julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
		}
		return fmt.Sprintf("%d de %s de %d", t.Day(), months[t.Month()-1], t.Year())
	}
	return t.Format("02/01/2006")
}

// includeFile pushes the current lexer state and switches to a new lexer for
// the included file. The file is searched relative to baseDir and in a
// templates/ subdirectory.
func (p *Parser) includeFile(filename string) {
	if filename == "" || len(p.lexerStack) >= 10 {
		return
	}
	candidates := []string{
		filepath.Join(p.baseDir, filename),
		filepath.Join(p.baseDir, filename+".tex"),
		filepath.Join(p.baseDir, "templates", filename),
		filepath.Join(p.baseDir, "templates", filename+".tex"),
	}
	for _, candidate := range candidates {
		data, err := os.ReadFile(candidate)
		if err != nil {
			continue
		}
		// Push current state so we can restore it when the include ends
		p.lexerStack = append(p.lexerStack, lexerFrame{
			l:         p.l,
			curToken:  p.curToken,
			peekToken: p.peekToken,
		})
		p.l = NewLexer(string(data))
		p.curToken = p.l.NextToken()
		p.peekToken = p.l.NextToken()
		return
	}
}

// parseOptionalArgString reads an optional [bracket argument] if present.
func (p *Parser) parseOptionalArgString() string {
	if p.curToken.Type != TokenOpenBracket {
		return ""
	}
	p.nextToken()
	var val strings.Builder
	for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
		val.WriteString(p.curToken.Value)
		p.nextToken()
	}
	if p.curToken.Type == TokenCloseBracket {
		p.nextToken()
	}
	return val.String()
}

func overlayMaxStep(overlay string) int {
	if overlay == "" {
		return 0
	}
	s := strings.TrimRight(overlay, "-")
	parts := strings.FieldsFunc(s, func(r rune) bool { return r == '-' || r == ',' })
	max := 0
	for _, part := range parts {
		n, err := strconv.Atoi(strings.TrimSpace(part))
		if err == nil && n > max {
			max = n
		}
	}
	return max
}

func maxStepsFromContent(c Content) int {
	max := overlayMaxStep(c.Overlay)
	for _, child := range c.Children {
		if s := maxStepsFromContent(child); s > max {
			max = s
		}
	}
	for _, il := range c.Inline {
		if s := overlayMaxStep(il.Overlay); s > max {
			max = s
		}
	}
	return max
}

func (p *Parser) ParsePresentation() (*Presentation, error) {
	pres := &Presentation{
		Frames:   []Frame{},
		Sections: []Section{},
		Theme:    "default",
	}
	currentSection := ""

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand {
			switch p.curToken.Value {
			case "title":
				pres.Title = p.parseRawArgument()
			case "author":
				pres.Author = p.parseRawArgument()
			case "institute":
				pres.Institute = p.parseRawArgument()
			case "date":
				d := p.parseRawArgument()
				if d == "today" || d == "" {
					pres.Date = formatDate(time.Now(), pres.Language)
				} else {
					pres.Date = d
				}
			case "usetheme":
				pres.Theme = strings.ToLower(p.parseRawArgument())
			case "section":
				s := p.parseRawArgument()
				currentSection = s
				pres.Sections = append(pres.Sections, Section{
					Title:      s,
					SlideIndex: len(pres.Frames),
				})
			case "subsection", "subsubsection":
				_ = p.parseRawArgument()
			case "usepackage":
				p.nextToken() // skip \usepackage
				opts := p.parseOptionalArgString()
				pkg := ""
				if p.curToken.Type == TokenOpenBrace {
					p.nextToken()
					var sb strings.Builder
					for p.curToken.Type != TokenCloseBrace && p.curToken.Type != TokenEOF {
						sb.WriteString(p.curToken.Value)
						p.nextToken()
					}
					if p.curToken.Type == TokenCloseBrace {
						p.nextToken()
					}
					pkg = strings.TrimSpace(sb.String())
				}
				if pkg != "" {
					pres.Packages = append(pres.Packages, pkg)
					switch pkg {
					case "babel", "polyglossia":
						if strings.Contains(opts, "brazil") || strings.Contains(opts, "portuguese") {
							pres.Language = "pt-BR"
						}
					}
				}
			case "addbibresource", "bibliography":
				resource := p.parseRawArgument()
				if resource != "" {
					pres.BibResources = append(pres.BibResources, resource)
				}
			case "input", "include", "subfile":
				filename := p.parseRawArgument()
				p.includeFile(filename)
				continue
			case "begin":
				arg := p.parseRawArgument()
				if arg == "frame" {
					frame, err := p.parseFrame()
					if err != nil {
						return nil, err
					}
					frame.Section = currentSection
					pres.Frames = append(pres.Frames, frame)
				} else if arg == "document" {
					// nothing
				} else if arg != "" {
					p.skipEnvironment(arg)
				}
			case "end":
				_ = p.parseRawArgument()
			default:
				p.skipUnknownCommand()
			}
		} else {
			p.nextToken()
		}
	}

	// Export ordered citation list
	for _, key := range p.citationKeys {
		pres.Citations = append(pres.Citations, CitationRef{
			Key:   key,
			Index: p.citationMap[key],
		})
	}

	return pres, nil
}

// parseRawArgument reads {content}, skipping an optional leading [...].
func (p *Parser) parseRawArgument() string {
	if p.curToken.Type == TokenCommand {
		p.nextToken()
	}
	// Skip optional [short form]
	if p.curToken.Type == TokenOpenBracket {
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			p.nextToken()
		}
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
	p.nextToken()
	var overlay strings.Builder
	for p.curToken.Type != TokenGreaterThan && p.curToken.Type != TokenEOF {
		overlay.WriteString(p.curToken.Value)
		p.nextToken()
	}
	p.nextToken()
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

// skipEnvironment skips a \begin{env}...\end{env} block.
func (p *Parser) skipEnvironment(envName string) {
	// Skip any extra args like {99} in \begin{thebibliography}{99}
	for p.curToken.Type == TokenOpenBrace || p.curToken.Type == TokenOpenBracket {
		closeType := TokenCloseBrace
		if p.curToken.Type == TokenOpenBracket {
			closeType = TokenCloseBracket
		}
		p.nextToken()
		for p.curToken.Type != closeType && p.curToken.Type != TokenEOF {
			p.nextToken()
		}
		if p.curToken.Type != TokenEOF {
			p.nextToken()
		}
	}
	// Skip body until \end{envName}
	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand && p.curToken.Value == "end" {
			arg := p.parseRawArgument()
			if arg == envName {
				return
			}
		} else {
			p.nextToken()
		}
	}
}

func (p *Parser) parseFrame() (Frame, error) {
	var frame Frame
	pauseStep := 1
	maxStep := 1

	_ = p.parseOverlaySpecification()

	// Parse optional [options] and detect plain flag
	if p.curToken.Type == TokenOpenBracket {
		p.nextToken()
		var opts strings.Builder
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			opts.WriteString(p.curToken.Value)
			p.nextToken()
		}
		p.nextToken()
		if strings.Contains(opts.String(), "plain") {
			frame.Plain = true
		}
	}

	_ = p.parseOverlaySpecification()

	if p.curToken.Type == TokenOpenBrace {
		frame.Title = p.parseRawArgument()
	}
	if p.curToken.Type == TokenOpenBrace {
		frame.Subtitle = p.parseRawArgument()
	}

	frame.Content = []Content{}

frameLoop:
	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand {
			switch p.curToken.Value {
			case "end":
				arg := p.parseRawArgument()
				if arg == "frame" {
					break frameLoop
				}
				continue
			case "pause":
				pauseStep++
				if pauseStep > maxStep {
					maxStep = pauseStep
				}
				p.nextToken()
				continue
			case "frametitle":
				p.nextToken()
				frame.Title = p.parseRawArgument()
				continue
			case "framesubtitle":
				p.nextToken()
				frame.Subtitle = p.parseRawArgument()
				continue
			case "note":
				p.nextToken()
				if p.curToken.Type == TokenOpenBracket {
					for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
						p.nextToken()
					}
					p.nextToken()
				}
				note := p.parseRawArgument()
				if frame.Notes != "" {
					frame.Notes += "\n"
				}
				frame.Notes += strings.TrimSpace(note)
				continue
			case "titlepage":
				frame.TitlePage = true
				p.nextToken()
				continue
			case "tableofcontents":
				p.nextToken()
				if p.curToken.Type == TokenOpenBracket {
					for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
						p.nextToken()
					}
					p.nextToken()
				}
				frame.Content = append(frame.Content, Content{Type: ContentTOC})
				continue
			case "bigskip", "medskip", "smallskip":
				p.nextToken()
				frame.Content = append(frame.Content, Content{Type: ContentSpacer})
				continue
			case "vspace", "vskip":
				p.nextToken()
				if p.curToken.Type == TokenOpenBrace || p.curToken.Type == TokenOpenBracket {
					p.skipUnknownCommand()
				}
				frame.Content = append(frame.Content, Content{Type: ContentSpacer})
				continue
			}
		}

		content, err := p.parseContent()
		if err != nil {
			return frame, err
		}
		if content != nil {
			if pauseStep > 1 && content.Overlay == "" {
				content.Overlay = fmt.Sprintf("%d-", pauseStep)
			}
			frame.Content = append(frame.Content, *content)
			if s := maxStepsFromContent(*content); s > maxStep {
				maxStep = s
			}
		}
	}

	frame.MaxSteps = maxStep
	frame.Notes = strings.TrimSpace(frame.Notes)
	return frame, nil
}

func (p *Parser) parseContent() (*Content, error) {
	if p.curToken.Type == TokenCommand {
		switch p.curToken.Value {
		case "begin":
			env := p.parseRawArgument()
			switch env {
			case "block", "alertblock", "exampleblock":
				return p.parseBlock(env)
			case "columns":
				return p.parseColumns()
			case "column":
				return p.parseColumn()
			case "itemize", "enumerate":
				return p.parseSliceList(env)
			case "onlyenv", "uncoverenv", "visibleenv":
				return p.parseOverlayEnv(env)
			case "verbatim":
				return p.parseVerbatim()
			case "lstlisting", "minted":
				return p.parseLstlisting(env)
			case "tabular", "array":
				return p.parseTabular()
			case "quote", "quotation", "verse":
				return p.parseQuote(env)
			case "thebibliography":
				p.skipEnvironment("thebibliography")
				return &Content{Type: ContentBibliography}, nil
			default:
				if env != "" {
					p.skipEnvironment(env)
				}
				return nil, nil
			}
		case "includegraphics":
			return p.parseImage(), nil
		case "printbibliography":
			p.nextToken()
			_ = p.parseOptionalArgString() // e.g. [title=References]
			return &Content{Type: ContentBibliography}, nil
		case "input", "include", "subfile":
			filename := p.parseRawArgument()
			p.includeFile(filename)
			return nil, nil
		case "inputminted":
			lang := p.parseRawArgument()
			path := p.parseRawArgument()
			if p.baseDir != "" {
				for _, candidate := range []string{
					filepath.Join(p.baseDir, path),
					filepath.Join(p.baseDir, "templates", path),
				} {
					data, err := os.ReadFile(candidate)
					if err == nil {
						return &Content{Type: ContentCode, Lang: strings.ToLower(lang), Title: string(data)}, nil
					}
				}
			}
			return nil, nil
		case "only", "uncover", "visible":
			p.nextToken()
			overlay := p.parseOverlaySpecification()
			if overlay == "" {
				overlay = "1-"
			}
			if p.curToken.Type == TokenOpenBrace {
				p.nextToken()
				inlineElements := p.parseInlineTokens(func() bool {
					return p.curToken.Type == TokenEOF || p.curToken.Type == TokenCloseBrace
				})
				if p.curToken.Type == TokenCloseBrace {
					p.nextToken()
				}
				if len(inlineElements) > 0 {
					return &Content{Type: ContentRichText, Overlay: overlay, Inline: inlineElements}, nil
				}
			}
			return nil, nil
		case "end":
			return nil, nil
		}
	}

	inlineElements := p.parseInlineTokens(func() bool {
		if p.curToken.Type == TokenEOF {
			return true
		}
		if p.curToken.Type == TokenCommand {
			switch p.curToken.Value {
			case "begin", "end", "item", "includegraphics",
				"pause", "note", "frametitle", "framesubtitle",
				"only", "uncover", "visible",
				"bigskip", "medskip", "smallskip", "vspace", "vskip":
				return true
			}
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
			p.nextToken()
			overlay := p.parseOverlaySpecification()
			switch cmd {
			case "textbf":
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineBold, Value: arg, Overlay: overlay})
			case "textit", "emph":
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineItalic, Value: arg, Overlay: overlay})
			case "alert":
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineAlert, Value: arg, Overlay: overlay})
			case "textcolor":
				color := p.parseRawArgument()
				text := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineColored, Color: color, Value: text, Overlay: overlay})
			case "footcite", "cite", "autocite", "textcite", "parencite",
				"citeauthor", "citeyear", "citetitle", "footnotemark":
				arg := p.parseRawArgument()
				p.citationRef(arg) // record order
				elements = append(elements, InlineContent{Type: InlineCitation, Value: arg, Overlay: overlay})
			case "footnote":
				_ = p.parseRawArgument()
				p.citationRef("footnote")
				elements = append(elements, InlineContent{Type: InlineCitation, Value: "footnote", Overlay: overlay})
			case "textrm", "textsf", "texttt", "textnormal", "text", "mbox",
				"textsc", "textup":
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlinePureText, Value: arg, Overlay: overlay})
			// Font size commands: consume optional {} argument if present, output text
			case "Huge", "huge", "LARGE", "Large", "large",
				"normalsize", "small", "footnotesize", "scriptsize", "tiny":
				// These don't take arguments; text follows
			case "\\":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: " "})
			// Special character escapes
			case "&", "%", "#", "_", "^", "~", "{", "}":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: cmd})
			case "ldots", "dots":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "…"})
			case "textendash":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "–"})
			case "textemdash":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "—"})
			case "href":
				url := p.parseRawArgument()
				label := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineURL, Value: label, Color: url, Overlay: overlay})
			case "url", "nolinkurl":
				link := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineURL, Value: link, Color: link, Overlay: overlay})
			case "enquote", "textquote":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "\u201C"})
				if p.curToken.Type == TokenOpenBrace {
					p.nextToken()
					inner := p.parseInlineTokens(func() bool {
						return p.curToken.Type == TokenEOF || p.curToken.Type == TokenCloseBrace
					})
					if p.curToken.Type == TokenCloseBrace {
						p.nextToken()
					}
					elements = append(elements, inner...)
				}
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "\u201D"})
			case "toprule", "midrule", "bottomrule", "hline":
				// booktabs / standard table rules — silently skip
			default:
				// Unknown command with a brace argument: absorb the arg as text
				if p.curToken.Type == TokenOpenBrace {
					arg := p.parseRawArgument()
					if strings.TrimSpace(arg) != "" {
						elements = append(elements, InlineContent{Type: InlinePureText, Value: arg})
					}
				}
				// Otherwise: silently skip (no nextToken needed, already advanced past cmd)
			}
		default:
			p.nextToken()
		}
	}
	return elements
}

func (p *Parser) parseQuote(envName string) (*Content, error) {
	quote := &Content{Type: ContentQuote, Children: []Content{}}
	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand && p.curToken.Value == "end" {
			arg := p.parseRawArgument()
			if arg == envName || arg == "quote" || arg == "quotation" || arg == "verse" {
				break
			}
		}
		content, err := p.parseContent()
		if err != nil {
			return nil, err
		}
		if content != nil {
			quote.Children = append(quote.Children, *content)
		}
	}
	return quote, nil
}

func (p *Parser) parseBlock(envName string) (*Content, error) {
	block := &Content{Type: ContentBlock, Children: []Content{}}
	block.Overlay = p.parseOverlaySpecification()
	if p.curToken.Type == TokenOpenBrace {
		block.Title = p.parseRawArgument()
	}
	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand && p.curToken.Value == "end" {
			arg := p.parseRawArgument()
			if arg == envName || arg == "block" || arg == "alertblock" || arg == "exampleblock" {
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
	if p.curToken.Type == TokenOpenBracket {
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			p.nextToken()
		}
		p.nextToken()
	}
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
	if p.curToken.Type == TokenOpenBracket {
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			p.nextToken()
		}
		p.nextToken()
	}
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

func (p *Parser) parseOverlayEnv(envName string) (*Content, error) {
	overlay := p.parseOverlaySpecification()
	if overlay == "" {
		overlay = "1-"
	}
	container := &Content{Type: ContentBlock, Overlay: overlay, Children: []Content{}}
	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand && p.curToken.Value == "end" {
			arg := p.parseRawArgument()
			if arg == envName {
				break
			}
		}
		content, err := p.parseContent()
		if err != nil {
			return nil, err
		}
		if content != nil {
			container.Children = append(container.Children, *content)
		}
	}
	return container, nil
}

func (p *Parser) parseVerbatim() (*Content, error) {
	raw := p.l.ReadRawUntil(`\end{verbatim}`)
	p.curToken = p.l.NextToken()
	p.peekToken = p.l.NextToken()
	return &Content{Type: ContentVerbatim, Title: strings.TrimLeft(raw, "\n\r")}, nil
}

func (p *Parser) parseLstlisting(envName string) (*Content, error) {
	lang := ""
	if p.curToken.Type == TokenOpenBracket {
		p.nextToken()
		var opts strings.Builder
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			opts.WriteString(p.curToken.Value)
			p.nextToken()
		}
		p.nextToken()
		optsStr := opts.String()
		if idx := strings.Index(optsStr, "language="); idx != -1 {
			after := optsStr[idx+9:]
			end := strings.IndexAny(after, ",]")
			if end == -1 {
				lang = strings.TrimSpace(after)
			} else {
				lang = strings.TrimSpace(after[:end])
			}
		} else if !strings.Contains(optsStr, "=") {
			lang = strings.TrimSpace(optsStr)
		}
	}
	if envName == "minted" && p.curToken.Type == TokenOpenBrace {
		lang = p.parseRawArgument()
	}
	endMarker := fmt.Sprintf(`\end{%s}`, envName)
	raw := p.l.ReadRawUntil(endMarker)
	p.curToken = p.l.NextToken()
	p.peekToken = p.l.NextToken()
	return &Content{Type: ContentCode, Lang: strings.ToLower(lang), Title: strings.TrimLeft(raw, "\n\r")}, nil
}

func (p *Parser) parseTabular() (*Content, error) {
	if p.curToken.Type == TokenOpenBrace {
		p.parseRawArgument()
	}
	raw := p.l.ReadRawUntil(`\end{tabular}`)
	p.curToken = p.l.NextToken()
	p.peekToken = p.l.NextToken()

	table := &Content{Type: ContentTable, Children: []Content{}}
	rows := strings.Split(raw, `\\`)
	for _, row := range rows {
		row = strings.ReplaceAll(row, `\hline`, "")
		for _, rule := range []string{`\toprule`, `\midrule`, `\bottomrule`} {
			row = strings.ReplaceAll(row, rule, "")
		}
		row = strings.TrimSpace(row)
		if row == "" {
			continue
		}
		cells := strings.Split(row, "&")
		tableRow := Content{Type: ContentTableRow, Children: []Content{}}
		for _, cell := range cells {
			cell = strings.TrimSpace(cell)
			if cell == "" {
				cell = " "
			}
			tableRow.Children = append(tableRow.Children, Content{
				Type:   ContentRichText,
				Inline: []InlineContent{{Type: InlinePureText, Value: cell}},
			})
		}
		if len(tableRow.Children) > 0 {
			table.Children = append(table.Children, tableRow)
		}
	}
	return table, nil
}

func (p *Parser) parseImage() *Content {
	p.nextToken()
	if p.curToken.Type == TokenOpenBracket {
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			p.nextToken()
		}
		p.nextToken()
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
	if p.curToken.Type == TokenOpenBracket {
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			p.nextToken()
		}
		p.nextToken()
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
				p.nextToken()
				itemOverlay := p.parseOverlaySpecification()
				if p.curToken.Type == TokenOpenBracket {
					for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
						p.nextToken()
					}
					p.nextToken()
				}
				inlineElements := p.parseInlineTokens(func() bool {
					return p.curToken.Type == TokenEOF ||
						(p.curToken.Type == TokenCommand &&
							(p.curToken.Value == "item" || p.curToken.Value == "end" || p.curToken.Value == "pause"))
				})
				list.Children = append(list.Children, Content{
					Type:    ContentRichText,
					Overlay: itemOverlay,
					Inline:  inlineElements,
				})
				continue
			}
			if p.curToken.Value == "pause" {
				p.nextToken()
				continue
			}
		}
		p.nextToken()
	}
	return list, nil
}
