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
	Subtitle     string        `json:"subtitle,omitempty"`
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
	ContentVFill        ContentType = "vfill"
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
	InlineCode     InlineType = "code"
)

type InlineContent struct {
	Type    InlineType `json:"type"`
	Value   string     `json:"value"`
	Color   string     `json:"color,omitempty"`
	Overlay string     `json:"overlay,omitempty"`
	Size    string     `json:"size,omitempty"`
}

// fontSizeEmMap maps LaTeX font-size commands to CSS em values.
var fontSizeEmMap = map[string]string{
	"Huge":         "2.5em",
	"huge":         "2em",
	"LARGE":        "1.7em",
	"Large":        "1.5em",
	"large":        "1.2em",
	"normalsize":   "1em",
	"small":        "0.85em",
	"footnotesize": "0.75em",
	"scriptsize":   "0.65em",
	"tiny":         "0.5em",
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
	Centered bool            `json:"centered,omitempty"`
}

type customCodeEnvInfo struct {
	nargs int
	lang  string
}

type Parser struct {
	l              *Lexer
	lexerStack     []lexerFrame
	baseDir        string
	graphicPaths   []string
	curToken       Token
	peekToken      Token
	citationIndex  int
	citationMap    map[string]int
	citationKeys   []string
	namedColors    map[string]string
	lstStyles      map[string]string
	customCodeEnvs map[string]customCodeEnvInfo
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

func (p *Parser) ParsePresentation() (pres *Presentation, err error) {
	// Recover from any unexpected panics so the server always returns an error
	// response instead of hanging or crashing the handler goroutine.
	defer func() {
		if r := recover(); r != nil {
			pres = nil
			err = fmt.Errorf("internal parser error: %v", r)
		}
	}()

	pres = &Presentation{
		Frames:   []Frame{},
		Sections: []Section{},
		Theme:    "default",
	}
	currentSection := ""

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand {
			switch p.curToken.Value {
			case "title":
				pres.Title = p.parseMetadataArg("")
			case "subtitle":
				pres.Subtitle = p.parseMetadataArg("")
			case "author":
				pres.Author = p.parseMetadataArg("")
			case "institute":
				pres.Institute = p.parseMetadataArg("")
			case "date":
				d := p.parseMetadataArg(pres.Language)
				if d == "" {
					d = formatDate(time.Now(), pres.Language)
				}
				pres.Date = d
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
			case "graphicspath":
				p.parseGraphicsPaths()
				continue
			case "definecolor":
				// \definecolor{name}{model}{value}
				p.nextToken()
				name := strings.ToLower(strings.TrimSpace(p.parseRawArgument()))
				model := strings.ToLower(strings.TrimSpace(p.parseRawArgument()))
				value := strings.TrimSpace(p.parseRawArgument())
				if p.namedColors == nil {
					p.namedColors = make(map[string]string)
				}
				switch model {
				case "html":
					p.namedColors[name] = "#" + strings.ToLower(value)
				case "rgb":
					parts := strings.Split(value, ",")
					if len(parts) == 3 {
						var rgbVals [3]int
						allOk := true
						for i, part := range parts {
							f, err := strconv.ParseFloat(strings.TrimSpace(part), 64)
							if err != nil {
								allOk = false
								break
							}
							rgbVals[i] = int(f * 255)
						}
						if allOk {
							p.namedColors[name] = fmt.Sprintf("rgb(%d,%d,%d)", rgbVals[0], rgbVals[1], rgbVals[2])
						}
					}
				}
				continue
			case "colorlet":
				// \colorlet{newname}{existingname}
				p.nextToken()
				newName := strings.ToLower(strings.TrimSpace(p.parseRawArgument()))
				// Skip optional [model] if present
				_ = p.parseOptionalArgString()
				otherName := strings.ToLower(strings.TrimSpace(p.parseRawArgument()))
				if p.namedColors != nil {
					if c, ok := p.namedColors[otherName]; ok {
						p.namedColors[newName] = c
					}
				}
				continue
			case "lstdefinestyle", "lstdefinelanguage":
				// \lstdefinestyle{name}{options} — extract language hint
				p.nextToken()
				name := strings.ToLower(strings.TrimSpace(p.parseRawArgument()))
				opts := p.readBraceGroupRaw()
				lang := extractLstOption(opts, "language")
				if lang != "" {
					if p.lstStyles == nil {
						p.lstStyles = make(map[string]string)
					}
					p.lstStyles[name] = strings.ToLower(lang)
				}
				continue
			case "newtcblisting", "lstnewenvironment", "newtcbinputlisting":
				// \newtcblisting{envName}[nargs]{options}
				p.nextToken()
				envName := strings.ToLower(strings.TrimSpace(p.parseRawArgument()))
				nargs := 0
				if p.curToken.Type == TokenOpenBracket {
					nb := p.parseOptionalArgString()
					nargs, _ = strconv.Atoi(strings.TrimSpace(nb))
				}
				// Read all remaining brace groups (may be 1 or more for begin/end defs)
				var allOpts strings.Builder
				for p.curToken.Type == TokenOpenBrace {
					allOpts.WriteString(p.readBraceGroupRaw())
					allOpts.WriteByte(' ')
				}
				opts := allOpts.String()
				lang := extractLstOption(opts, "language")
				if lang == "" {
					// Try via style= lookup in listing options
					styleName := strings.ToLower(extractLstOption(opts, "style"))
					if styleName != "" && p.lstStyles != nil {
						lang = p.lstStyles[styleName]
					}
				}
				if p.customCodeEnvs == nil {
					p.customCodeEnvs = make(map[string]customCodeEnvInfo)
				}
				p.customCodeEnvs[envName] = customCodeEnvInfo{nargs: nargs, lang: strings.ToLower(lang)}
				continue
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
// parseMetadataArg reads a \command[opt]{content} metadata argument and
// returns a clean human-readable string. It correctly handles nested braces,
// converts \\ to newlines, strips LaTeX spacing commands (\smallskip etc.),
// unwraps inline formatting wrappers (\textit, \textbf, \emph, etc.) so
// their content passes through without the surrounding braces, and expands
// \today to a formatted date using the supplied language code.
func (p *Parser) parseMetadataArg(lang string) string {
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
	p.nextToken() // consume opening {
	var sb strings.Builder
	depth := 1
	for depth > 0 && p.curToken.Type != TokenEOF {
		switch p.curToken.Type {
		case TokenOpenBrace:
			depth++
			p.nextToken()
		case TokenCloseBrace:
			depth--
			p.nextToken()
		case TokenText:
			sb.WriteString(p.curToken.Value)
			p.nextToken()
		case TokenMath:
			sb.WriteString(p.curToken.Value)
			p.nextToken()
		case TokenCommand:
			cmd := p.curToken.Value
			p.nextToken()
			switch cmd {
			case "\\":
				sb.WriteString("\n")
			case "today":
				sb.WriteString(formatDate(time.Now(), lang))
			case "smallskip", "medskip", "bigskip", "vspace", "hspace",
				"noindent", "newline", "par":
				// Skip spacing commands and any brace argument they may take.
				if p.curToken.Type == TokenOpenBrace {
					for p.curToken.Type != TokenCloseBrace && p.curToken.Type != TokenEOF {
						p.nextToken()
					}
					if p.curToken.Type == TokenCloseBrace {
						p.nextToken()
					}
				}
			case "textit", "textbf", "emph", "textrm", "textsf", "texttt",
				"text", "mbox", "textsc", "textup", "textnormal":
				// Formatting wrappers: skip the command name; the brace content
				// is captured naturally via the depth counter above.
			case "and":
				sb.WriteString(" \u0026 ")
			case "&", "%", "#", "_":
				sb.WriteString(cmd)
			case "ldots", "dots":
				sb.WriteString("…")
			case "textendash":
				sb.WriteString("–")
			case "textemdash":
				sb.WriteString("—")
				// All other unknown commands are silently skipped.
			}
		default:
			p.nextToken()
		}
	}
	return strings.TrimSpace(sb.String())
}

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

// skipEnvironment skips a \begin{env}...\end{env} block, correctly
// handling nested environments with the same name (depth tracking).
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
	// Skip body, tracking depth for nested same-name environments.
	depth := 1
	for p.curToken.Type != TokenEOF && depth > 0 {
		if p.curToken.Type == TokenCommand {
			switch p.curToken.Value {
			case "begin":
				arg := p.parseRawArgument()
				if arg == envName {
					depth++
				}
				continue
			case "end":
				arg := p.parseRawArgument()
				if arg == envName {
					depth--
				}
				continue
			}
		}
		p.nextToken()
	}
}

func (p *Parser) parseFrame() (Frame, error) {
	var frame Frame
	pauseStep := 1
	maxStep := 1
	pendingCentered := false

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
			case "vfill":
				p.nextToken()
				frame.Content = append(frame.Content, Content{Type: ContentVFill})
				continue
			case "centering":
				// Set a flag on the next content item; handled via a pending state
				p.nextToken()
				pendingCentered = true
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
			if pendingCentered {
				content.Centered = true
				pendingCentered = false
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
			case "description":
				return p.parseDescriptionList()
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
			// Math display environments
			case "equation", "equation*", "align", "align*",
				"gather", "gather*", "multline", "multline*",
				"eqnarray", "eqnarray*":
				mathContent := p.parseRawMathContent(env)
				if mathContent == "" {
					return nil, nil
				}
				wrapped := wrapMathEnv(env, mathContent)
				return &Content{
					Type:   ContentRichText,
					Inline: []InlineContent{{Type: InlineMathMode, Value: wrapped}},
				}, nil
			// Theorem-like environments
			case "theorem", "lemma", "corollary", "proof",
				"definition", "example", "remark", "proposition":
				return p.parseTheoremBlock(env)
			// Wrapper environments: parse children, unwrap if single
			case "figure", "figure*", "table", "table*", "center":
				return p.parseGenericWrapper(env)
			case "thebibliography":
				p.skipEnvironment("thebibliography")
				return &Content{Type: ContentBibliography}, nil
			default:
				if env != "" {
					if p.customCodeEnvs != nil {
						if cce, ok := p.customCodeEnvs[strings.ToLower(env)]; ok {
							return p.parseCustomCodeBlock(env, cce)
						}
					}
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
		case "bigskip", "medskip", "smallskip":
			p.nextToken()
			return &Content{Type: ContentSpacer}, nil
		case "vfill":
			p.nextToken()
			return &Content{Type: ContentVFill}, nil
		case "vspace", "vskip":
			p.nextToken()
			if p.curToken.Type == TokenOpenBrace || p.curToken.Type == TokenOpenBracket {
				p.skipUnknownCommand()
			}
			return &Content{Type: ContentSpacer}, nil
		case "centering":
			p.nextToken()
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
	// Track font size through LaTeX scopes { ... }
	currentFontSize := ""
	var fontSizeStack []string

	for !stopCondition() {
		switch p.curToken.Type {
		case TokenText:
			text := p.curToken.Value
			p.nextToken()
			if strings.TrimSpace(text) != "" {
				elements = append(elements, InlineContent{Type: InlinePureText, Value: text, Size: currentFontSize})
			}
		case TokenMath:
			val := p.curToken.Value
			p.nextToken()
			elements = append(elements, InlineContent{Type: InlineMathMode, Value: val, Size: currentFontSize})
		case TokenOpenBrace:
			// Push current size onto the scope stack (groups inherit parent size)
			fontSizeStack = append(fontSizeStack, currentFontSize)
			p.nextToken()
		case TokenCloseBrace:
			// Restore size from the enclosing scope
			if len(fontSizeStack) > 0 {
				currentFontSize = fontSizeStack[len(fontSizeStack)-1]
				fontSizeStack = fontSizeStack[:len(fontSizeStack)-1]
			} else {
				currentFontSize = ""
			}
			p.nextToken()
		case TokenCommand:
			cmd := p.curToken.Value
			p.nextToken()
			overlay := p.parseOverlaySpecification()
			switch cmd {
			case "textbf":
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineBold, Value: arg, Overlay: overlay, Size: currentFontSize})
			case "textit", "emph":
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineItalic, Value: arg, Overlay: overlay, Size: currentFontSize})
			case "alert":
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineAlert, Value: arg, Overlay: overlay, Size: currentFontSize})
			case "textcolor":
				color := p.parseRawArgument()
				text := p.parseRawArgument()
				if p.namedColors != nil {
					if resolved, ok := p.namedColors[strings.ToLower(color)]; ok {
						color = resolved
					}
				}
				elements = append(elements, InlineContent{Type: InlineColored, Color: color, Value: text, Overlay: overlay, Size: currentFontSize})
			case "footcite", "cite", "autocite", "textcite", "parencite",
				"citeauthor", "citeyear", "citetitle", "footnotemark":
				arg := p.parseRawArgument()
				p.citationRef(arg)
				elements = append(elements, InlineContent{Type: InlineCitation, Value: arg, Overlay: overlay})
			case "footnote":
				_ = p.parseRawArgument()
				p.citationRef("footnote")
				elements = append(elements, InlineContent{Type: InlineCitation, Value: "footnote", Overlay: overlay})
			case "texttt":
				arg := strings.Trim(p.parseRawArgument(), "`")
				elements = append(elements, InlineContent{Type: InlineCode, Value: arg, Overlay: overlay, Size: currentFontSize})
			case "textrm", "textsf", "textnormal", "text", "mbox",
				"textsc", "textup":
				arg := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlinePureText, Value: arg, Overlay: overlay, Size: currentFontSize})
			case "Huge", "huge", "LARGE", "Large", "large",
				"normalsize", "small", "footnotesize", "scriptsize", "tiny":
				// Update current font size for subsequent tokens in this scope
				if size, ok := fontSizeEmMap[cmd]; ok {
					currentFontSize = size
				}
			case "\\":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: " ", Size: currentFontSize})
			// Special character escapes
			case "&", "%", "#", "_", "^", "~", "{", "}":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: cmd, Size: currentFontSize})
			case "ldots", "dots":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "…", Size: currentFontSize})
			case "textendash":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "–", Size: currentFontSize})
			case "textemdash":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "—", Size: currentFontSize})
			case "href":
				url := p.parseRawArgument()
				label := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineURL, Value: label, Color: url, Overlay: overlay, Size: currentFontSize})
			case "url", "nolinkurl":
				link := p.parseRawArgument()
				elements = append(elements, InlineContent{Type: InlineURL, Value: link, Color: link, Overlay: overlay, Size: currentFontSize})
			case "enquote", "textquote":
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "\u201C", Size: currentFontSize})
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
				elements = append(elements, InlineContent{Type: InlinePureText, Value: "\u201D", Size: currentFontSize})
			case "toprule", "midrule", "bottomrule", "hline":
				// booktabs / standard table rules — silently skip
			default:
				// Unknown command with a brace argument: absorb the arg as text
				if p.curToken.Type == TokenOpenBrace {
					arg := p.parseRawArgument()
					if strings.TrimSpace(arg) != "" {
						elements = append(elements, InlineContent{Type: InlinePureText, Value: arg, Size: currentFontSize})
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

// parseRawMathContent reads tokens from inside a math environment and
// reconstructs the LaTeX source as a string. It stops (and consumes) \end{envName}.
// The star variant \end{envName*} is also accepted.
func (p *Parser) parseRawMathContent(envName string) string {
	var sb strings.Builder
	baseName := strings.TrimSuffix(envName, "*")
	for p.curToken.Type != TokenEOF {
		switch p.curToken.Type {
		case TokenCommand:
			if p.curToken.Value == "end" {
				p.nextToken() // consume "end"
				if p.curToken.Type == TokenOpenBrace {
					p.nextToken() // consume "{"
					var name strings.Builder
					for p.curToken.Type != TokenCloseBrace && p.curToken.Type != TokenEOF {
						name.WriteString(p.curToken.Value)
						p.nextToken()
					}
					if p.curToken.Type == TokenCloseBrace {
						p.nextToken()
					}
					n := name.String()
					if n == envName || n == baseName {
						return strings.TrimSpace(sb.String())
					}
					sb.WriteString(`\end{`)
					sb.WriteString(n)
					sb.WriteString(`}`)
				}
				continue
			}
			// "\" is the line-break command — its value is already "\\"
			if strings.HasPrefix(p.curToken.Value, `\`) {
				sb.WriteString(p.curToken.Value)
			} else {
				sb.WriteString(`\`)
				sb.WriteString(p.curToken.Value)
			}
		case TokenText:
			sb.WriteString(p.curToken.Value)
		case TokenOpenBrace:
			sb.WriteString(`{`)
		case TokenCloseBrace:
			sb.WriteString(`}`)
		case TokenOpenBracket:
			sb.WriteString(`[`)
		case TokenCloseBracket:
			sb.WriteString(`]`)
		case TokenMath:
			sb.WriteString(`$`)
			sb.WriteString(p.curToken.Value)
			sb.WriteString(`$`)
		case TokenLessThan:
			sb.WriteString(`<`)
		case TokenGreaterThan:
			sb.WriteString(`>`)
		}
		p.nextToken()
	}
	return strings.TrimSpace(sb.String())
}

// wrapMathEnv wraps parsed math content with the appropriate KaTeX delimiters.
func wrapMathEnv(env, content string) string {
	switch strings.TrimSuffix(env, "*") {
	case "align", "eqnarray":
		return `\begin{aligned}` + content + `\end{aligned}`
	case "gather":
		return `\begin{gathered}` + content + `\end{gathered}`
	default:
		return content
	}
}

// parseTheoremBlock handles theorem-like environments: theorem, lemma, corollary,
// proof, definition, example, remark, proposition. Reads an optional [custom title].
func (p *Parser) parseTheoremBlock(envName string) (*Content, error) {
	block := &Content{Type: ContentBlock, Children: []Content{}}
	// Optional [custom subtitle/title override]
	custom := p.parseOptionalArgString()
	name := strings.ToUpper(envName[:1]) + envName[1:]
	if custom != "" {
		block.Title = name + " (" + strings.TrimSpace(custom) + ")"
	} else {
		block.Title = name
	}
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
			block.Children = append(block.Children, *content)
		}
	}
	return block, nil
}

// parseGenericWrapper parses wrapper environments (figure, table, center, etc.)
// collecting child content. Returns the single child (if only one) or a bare block.
func (p *Parser) parseGenericWrapper(envName string) (*Content, error) {
	// Skip optional placement args like [h], [htbp]
	_ = p.parseOptionalArgString()
	baseEnv := strings.TrimSuffix(envName, "*")
	wrapper := &Content{Type: ContentBlock, Children: []Content{}}
	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand {
			if p.curToken.Value == "end" {
				arg := p.parseRawArgument()
				if arg == envName || arg == baseEnv {
					break
				}
				continue
			}
			// Skip decoration commands that have no visual equivalent
			if p.curToken.Value == "centering" || p.curToken.Value == "label" ||
				p.curToken.Value == "captionof" {
				p.skipUnknownCommand()
				continue
			}
			// \caption[short]{text} — render as a centered paragraph
			if p.curToken.Value == "caption" {
				captionText := p.parseRawArgument()
				if captionText != "" {
					wrapper.Children = append(wrapper.Children, Content{
						Type:     ContentRichText,
						Inline:   []InlineContent{{Type: InlinePureText, Value: captionText}},
						Centered: true,
					})
				}
				continue
			}
		}
		content, err := p.parseContent()
		if err != nil {
			return nil, err
		}
		if content != nil {
			wrapper.Children = append(wrapper.Children, *content)
		}
	}
	if len(wrapper.Children) == 0 {
		return nil, nil
	}
	if len(wrapper.Children) == 1 {
		child := wrapper.Children[0]
		return &child, nil
	}
	return wrapper, nil
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

// readBraceGroupRaw reads a {brace-group} with depth-tracking on the token
// stream and returns the raw concatenated content (without the outer braces).
// Unlike parseRawArgument it correctly handles nested {}.
func (p *Parser) readBraceGroupRaw() string {
	if p.curToken.Type != TokenOpenBrace {
		return ""
	}
	p.nextToken() // consume opening {
	var sb strings.Builder
	depth := 1
	for depth > 0 && p.curToken.Type != TokenEOF {
		switch p.curToken.Type {
		case TokenOpenBrace:
			depth++
			sb.WriteByte('{')
			p.nextToken()
		case TokenCloseBrace:
			depth--
			if depth > 0 {
				sb.WriteByte('}')
			}
			p.nextToken()
		case TokenCommand:
			sb.WriteByte('\\')
			sb.WriteString(p.curToken.Value)
			p.nextToken()
		default:
			sb.WriteString(p.curToken.Value)
			p.nextToken()
		}
	}
	return sb.String()
}

// extractLstOption searches opts for key=value or key={value} and returns
// the trimmed value, or "" when not found.
func extractLstOption(opts, key string) string {
	idx := strings.Index(opts, key+"=")
	if idx == -1 {
		return ""
	}
	after := strings.TrimSpace(opts[idx+len(key)+1:])
	if strings.HasPrefix(after, "{") {
		end := strings.Index(after[1:], "}")
		if end >= 0 {
			return strings.TrimSpace(after[1 : end+1])
		}
	}
	end := strings.IndexAny(after, ",\n}")
	if end == -1 {
		return strings.TrimSpace(after)
	}
	return strings.TrimSpace(after[:end])
}

// tokenRaw reconstructs the approximate raw LaTeX source for a single token.
// Used to recover lookahead tokens that were consumed before a raw-read.
func tokenRaw(t Token) string {
	switch t.Type {
	case TokenCommand:
		if t.Value == `\\` {
			return `\\`
		}
		return `\` + t.Value
	case TokenOpenBrace:
		return "{"
	case TokenCloseBrace:
		return "}"
	case TokenOpenBracket:
		return "["
	case TokenCloseBracket:
		return "]"
	case TokenLessThan:
		return "<"
	case TokenGreaterThan:
		return ">"
	case TokenMath:
		return "$" + t.Value + "$"
	case TokenEOF:
		return ""
	default:
		return t.Value
	}
}

// parseCustomCodeBlock handles a user-defined verbatim-listing environment
// registered via \newtcblisting or \lstnewenvironment.
// If the env declares nargs > 0 the first argument is used as the block title.
func (p *Parser) parseCustomCodeBlock(envName string, cce customCodeEnvInfo) (*Content, error) {
	title := ""
	if cce.nargs > 0 {
		title = strings.TrimSpace(p.parseRawArgument())
		for i := 1; i < cce.nargs; i++ {
			_ = p.parseRawArgument()
		}
	}
	endMarker := fmt.Sprintf(`\end{%s}`, envName)
	// After parsing the title arg the 2-token lookahead may have consumed part of
	// the end marker.  The typical case: readText() swallows the entire code body
	// as one token (curToken), then \end becomes peekToken, leaving the raw buffer
	// positioned right at {envName}.  Detect this split and handle it correctly.
	var codeContent string
	closingArg := "{" + envName + "}"
	if p.peekToken.Type == TokenCommand && p.peekToken.Value == "end" &&
		strings.HasPrefix(p.l.PeekRaw(len(closingArg)), closingArg) {
		// Split case: \end is in the lookahead, {envName} is at the raw head.
		codeContent = tokenRaw(p.curToken)
		_ = p.l.ReadRawUntil(closingArg) // consumes "{envName}" from raw buffer
	} else {
		// Normal case: the end marker is entirely in the raw buffer (or the code
		// body is split across multiple tokens, so we need to prepend the prefix).
		prefix := tokenRaw(p.curToken) + tokenRaw(p.peekToken)
		rawPart := p.l.ReadRawUntil(endMarker)
		codeContent = prefix + rawPart
	}
	p.curToken = p.l.NextToken()
	p.peekToken = p.l.NextToken()
	codeNode := &Content{
		Type:  ContentCode,
		Lang:  cce.lang,
		Title: strings.TrimLeft(codeContent, "\n\r"),
	}
	if title != "" {
		return &Content{
			Type:     ContentBlock,
			Title:    title,
			Children: []Content{*codeNode},
		}, nil
	}
	return codeNode, nil
}

func (p *Parser) parseVerbatim() (*Content, error) {
	// parseRawArgument() advanced the lookahead twice after consuming {verbatim},
	// so curToken and peekToken already hold the first two tokens of the verbatim
	// body. Reconstruct their raw form and prepend it to the ReadRawUntil output.
	prefix := tokenRaw(p.curToken) + tokenRaw(p.peekToken)
	raw := p.l.ReadRawUntil(`\end{verbatim}`)
	p.curToken = p.l.NextToken()
	p.peekToken = p.l.NextToken()
	return &Content{Type: ContentVerbatim, Title: strings.TrimLeft(prefix+raw, "\n\r")}, nil
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
	// Apply the same split-marker detection used by parseCustomCodeBlock.
	var codeContent string
	closingArg := "{" + envName + "}"
	if p.peekToken.Type == TokenCommand && p.peekToken.Value == "end" &&
		strings.HasPrefix(p.l.PeekRaw(len(closingArg)), closingArg) {
		codeContent = tokenRaw(p.curToken)
		_ = p.l.ReadRawUntil(closingArg)
	} else {
		prefix := tokenRaw(p.curToken) + tokenRaw(p.peekToken)
		rawPart := p.l.ReadRawUntil(endMarker)
		codeContent = prefix + rawPart
	}
	p.curToken = p.l.NextToken()
	p.peekToken = p.l.NextToken()
	return &Content{Type: ContentCode, Lang: strings.ToLower(lang), Title: strings.TrimLeft(codeContent, "\n\r")}, nil
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
				Inline: p.parseRawInline(cell),
			})
		}
		if len(tableRow.Children) > 0 {
			table.Children = append(table.Children, tableRow)
		}
	}
	return table, nil
}

// parseRawInline parses a raw LaTeX string (e.g. a table cell) as inline
// content by spinning up a temporary lexer. The caller's lexer state is
// fully preserved.
func (p *Parser) parseRawInline(raw string) []InlineContent {
	if strings.TrimSpace(raw) == "" {
		return []InlineContent{{Type: InlinePureText, Value: raw}}
	}
	// Save current lexer state.
	savedL := p.l
	savedCur := p.curToken
	savedPeek := p.peekToken
	savedStack := p.lexerStack

	// Set up a temporary lexer for the raw string.
	p.l = NewLexer(raw)
	p.lexerStack = nil
	p.curToken = p.l.NextToken()
	p.peekToken = p.l.NextToken()

	elements := p.parseInlineTokens(func() bool {
		return p.curToken.Type == TokenEOF
	})

	// Restore lexer state.
	p.l = savedL
	p.curToken = savedCur
	p.peekToken = savedPeek
	p.lexerStack = savedStack

	if len(elements) == 0 {
		return []InlineContent{{Type: InlinePureText, Value: raw}}
	}
	return elements
}

// parseGraphicsPaths parses \graphicspath{{dir1/}{dir2/}} and stores the
// directories in p.graphicPaths for use when resolving \includegraphics paths.
func (p *Parser) parseGraphicsPaths() {
	p.nextToken() // consume \graphicspath command token
	if p.curToken.Type != TokenOpenBrace {
		return
	}
	p.nextToken() // consume outer {
	for p.curToken.Type == TokenOpenBrace {
		p.nextToken() // consume inner {
		var dir strings.Builder
		for p.curToken.Type != TokenCloseBrace && p.curToken.Type != TokenEOF {
			dir.WriteString(p.curToken.Value)
			p.nextToken()
		}
		if p.curToken.Type == TokenCloseBrace {
			p.nextToken() // consume inner }
		}
		d := strings.TrimSpace(filepath.FromSlash(dir.String()))
		if d != "" && d != "." {
			p.graphicPaths = append(p.graphicPaths, d)
		}
	}
	if p.curToken.Type == TokenCloseBrace {
		p.nextToken() // consume outer }
	}
}

// resolveGraphicsPath resolves a raw image path by trying each graphicsPath
// directory. Returns the resolved path relative to baseDir, or rawPath as-is.
func (p *Parser) resolveGraphicsPath(rawPath string) string {
	if rawPath == "" || p.baseDir == "" {
		return rawPath
	}
	// Check as-is first
	if _, err := os.Stat(filepath.Join(p.baseDir, rawPath)); err == nil {
		return rawPath
	}
	// Try each graphicsPath prefix
	for _, gp := range p.graphicPaths {
		candidate := filepath.Join(gp, rawPath)
		if _, err := os.Stat(filepath.Join(p.baseDir, candidate)); err == nil {
			return filepath.ToSlash(candidate)
		}
	}
	return rawPath
}

func (p *Parser) parseImage() *Content {
	p.nextToken()
	imgWidth := ""
	if p.curToken.Type == TokenOpenBracket {
		p.nextToken()
		var opts strings.Builder
		for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
			opts.WriteString(p.curToken.Value)
			p.nextToken()
		}
		p.nextToken()
		// Extract width= value (e.g. width=0.8\linewidth, width=0.5\textwidth)
		optsStr := opts.String()
		if idx := strings.Index(optsStr, "width="); idx != -1 {
			after := optsStr[idx+6:]
			end := strings.IndexAny(after, ",]")
			if end == -1 {
				imgWidth = strings.TrimSpace(after)
			} else {
				imgWidth = strings.TrimSpace(after[:end])
			}
			// Convert \linewidth / \textwidth fractions to percentage
			for _, unit := range []string{`\linewidth`, `\textwidth`, `\columnwidth`} {
				if strings.HasSuffix(imgWidth, unit) {
					frac := strings.TrimSuffix(imgWidth, unit)
					frac = strings.TrimSpace(frac)
					if f, err := strconv.ParseFloat(frac, 64); err == nil {
						imgWidth = fmt.Sprintf("%.0f%%", f*100)
					} else {
						imgWidth = ""
					}
				}
			}
		}
	}
	rawPath := ""
	if p.curToken.Type == TokenOpenBrace {
		rawPath = p.parseRawArgument()
	}
	return &Content{Type: ContentImage, Path: p.resolveGraphicsPath(rawPath), Width: imgWidth}
}

func (p *Parser) parseSliceList(listType string) (*Content, error) {
	list := &Content{
		Type:     ContentList,
		Ordered:  listType == "enumerate",
		Children: []Content{},
	}
	// Skip optional [label/spacing] args
	_ = p.parseOptionalArgString()

	// Stop condition shared by all \item inline parsing
	itemStop := func() bool {
		return p.curToken.Type == TokenEOF ||
			(p.curToken.Type == TokenCommand &&
				(p.curToken.Value == "item" || p.curToken.Value == "end" ||
					p.curToken.Value == "pause" || p.curToken.Value == "begin"))
	}

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand {
			if p.curToken.Value == "end" {
				arg := p.parseRawArgument()
				if arg == listType || arg == "itemize" || arg == "enumerate" {
					break
				}
				continue
			}
			if p.curToken.Value == "item" {
				p.nextToken()
				itemOverlay := p.parseOverlaySpecification()
				// Skip optional [custom bullet]
				if p.curToken.Type == TokenOpenBracket {
					for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
						p.nextToken()
					}
					p.nextToken()
				}
				// Collect inline text
				inlineElements := p.parseInlineTokens(itemStop)
				item := Content{
					Type:    ContentRichText,
					Overlay: itemOverlay,
					Inline:  inlineElements,
				}
				// Collect any nested structures (\begin{itemize}, \begin{enumerate}, etc.)
				for p.curToken.Type == TokenCommand && p.curToken.Value == "begin" {
					nested, err := p.parseContent()
					if err != nil {
						return nil, err
					}
					if nested != nil {
						item.Children = append(item.Children, *nested)
					}
					// More inline text after the nested env
					more := p.parseInlineTokens(itemStop)
					item.Inline = append(item.Inline, more...)
				}
				list.Children = append(list.Children, item)
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

// parseDescriptionList handles \begin{description}...\end{description}.
// Each \item[label] becomes a rich-text item with a bold label prefix.
func (p *Parser) parseDescriptionList() (*Content, error) {
	list := &Content{Type: ContentList, Ordered: false, Children: []Content{}}
	// Skip optional args
	_ = p.parseOptionalArgString()

	itemStop := func() bool {
		return p.curToken.Type == TokenEOF ||
			(p.curToken.Type == TokenCommand &&
				(p.curToken.Value == "item" || p.curToken.Value == "end" ||
					p.curToken.Value == "pause" || p.curToken.Value == "begin"))
	}

	for p.curToken.Type != TokenEOF {
		if p.curToken.Type == TokenCommand {
			if p.curToken.Value == "end" {
				arg := p.parseRawArgument()
				if arg == "description" {
					break
				}
				continue
			}
			if p.curToken.Value == "item" {
				p.nextToken()
				itemOverlay := p.parseOverlaySpecification()
				// Read the mandatory [label] for description items
				label := ""
				if p.curToken.Type == TokenOpenBracket {
					p.nextToken()
					var lb strings.Builder
					for p.curToken.Type != TokenCloseBracket && p.curToken.Type != TokenEOF {
						lb.WriteString(p.curToken.Value)
						p.nextToken()
					}
					if p.curToken.Type == TokenCloseBracket {
						p.nextToken()
					}
					label = strings.TrimSpace(lb.String())
				}
				// Inline content follows the label
				inlineElements := p.parseInlineTokens(itemStop)
				// Prepend bold label
				if label != "" {
					labelEl := InlineContent{Type: InlineBold, Value: label + ":"}
					inlineElements = append([]InlineContent{labelEl, {Type: InlinePureText, Value: " "}}, inlineElements...)
				}
				item := Content{
					Type:    ContentRichText,
					Overlay: itemOverlay,
					Inline:  inlineElements,
				}
				// Nested structures
				for p.curToken.Type == TokenCommand && p.curToken.Value == "begin" {
					nested, err := p.parseContent()
					if err != nil {
						return nil, err
					}
					if nested != nil {
						item.Children = append(item.Children, *nested)
					}
				}
				list.Children = append(list.Children, item)
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
