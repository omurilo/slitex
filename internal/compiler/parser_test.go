package compiler

import (
	"strings"
	"testing"
)

func parseTeX(input string) (*Presentation, error) {
	l := NewLexer(input)
	p := NewParser(l, "")
	return p.ParsePresentation()
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

func TestParser_Title(t *testing.T) {
	pres, err := parseTeX(`\title{My Presentation}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Title != "My Presentation" {
		t.Errorf("expected 'My Presentation', got %q", pres.Title)
	}
}

func TestParser_Subtitle(t *testing.T) {
	pres, err := parseTeX(`\subtitle{A subtitle}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Subtitle != "A subtitle" {
		t.Errorf("expected 'A subtitle', got %q", pres.Subtitle)
	}
}

func TestParser_Author(t *testing.T) {
	pres, err := parseTeX(`\author{Jane Doe}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Author != "Jane Doe" {
		t.Errorf("expected 'Jane Doe', got %q", pres.Author)
	}
}

func TestParser_Institute(t *testing.T) {
	pres, err := parseTeX(`\institute{UFMG}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Institute != "UFMG" {
		t.Errorf("expected 'UFMG', got %q", pres.Institute)
	}
}

func TestParser_AuthorWithAnd(t *testing.T) {
	pres, err := parseTeX(`\author{Alice \and Bob}`)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(pres.Author, "Alice") || !strings.Contains(pres.Author, "Bob") {
		t.Errorf("expected author to contain 'Alice' and 'Bob', got %q", pres.Author)
	}
}

func TestParser_DefaultTheme(t *testing.T) {
	pres, err := parseTeX(`\title{Test}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Theme != "default" {
		t.Errorf("expected default theme, got %q", pres.Theme)
	}
}

func TestParser_UsethemeLowercased(t *testing.T) {
	pres, err := parseTeX(`\usetheme{Madrid}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Theme != "madrid" {
		t.Errorf("expected 'madrid', got %q", pres.Theme)
	}
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

func TestParser_UsepackageAdded(t *testing.T) {
	pres, err := parseTeX(`\usepackage{xcolor}`)
	if err != nil {
		t.Fatal(err)
	}
	if len(pres.Packages) == 0 || pres.Packages[0] != "xcolor" {
		t.Errorf("expected package 'xcolor', got %v", pres.Packages)
	}
}

func TestParser_UsepackageWithOptions(t *testing.T) {
	pres, err := parseTeX(`\usepackage[default]{opensans}`)
	if err != nil {
		t.Fatal(err)
	}
	found := false
	for _, pkg := range pres.Packages {
		if pkg == "opensans" {
			found = true
		}
	}
	if !found {
		t.Errorf("expected 'opensans' in packages, got %v", pres.Packages)
	}
}

func TestParser_UsepackageBabelPortuguese(t *testing.T) {
	pres, err := parseTeX(`\usepackage[brazil]{babel}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Language != "pt-BR" {
		t.Errorf("expected language 'pt-BR', got %q", pres.Language)
	}
}

func TestParser_UsepackageBabelPortugueseVariant(t *testing.T) {
	pres, err := parseTeX(`\usepackage[portuguese]{babel}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Language != "pt-BR" {
		t.Errorf("expected language 'pt-BR', got %q", pres.Language)
	}
}

func TestParser_MultiplePackages(t *testing.T) {
	pres, err := parseTeX(`
\usepackage{xcolor}
\usepackage{listings}
\usepackage{hyperref}
`)
	if err != nil {
		t.Fatal(err)
	}
	if len(pres.Packages) != 3 {
		t.Errorf("expected 3 packages, got %d: %v", len(pres.Packages), pres.Packages)
	}
}

// ---------------------------------------------------------------------------
// Macros
// ---------------------------------------------------------------------------

func TestParser_Newcommand(t *testing.T) {
	pres, err := parseTeX(`\newcommand{\R}{\mathbb{R}}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Macros == nil {
		t.Fatal("expected macros map, got nil")
	}
	if pres.Macros[`\R`] != `\mathbb{R}` {
		t.Errorf("expected macro \\R = '\\mathbb{R}', got %q", pres.Macros[`\R`])
	}
}

func TestParser_RenewcommandOverrides(t *testing.T) {
	pres, err := parseTeX(`
\newcommand{\vec}{\mathbf}
\renewcommand{\vec}{\boldsymbol}
`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Macros[`\vec`] != `\boldsymbol` {
		t.Errorf("expected \\vec = '\\boldsymbol' after renewcommand, got %q", pres.Macros[`\vec`])
	}
}

func TestParser_NewcommandStarVariant(t *testing.T) {
	pres, err := parseTeX(`\newcommand*{\N}{\mathbb{N}}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Macros[`\N`] != `\mathbb{N}` {
		t.Errorf("expected macro \\N, got %v", pres.Macros)
	}
}

func TestParser_DeclareMathOperator(t *testing.T) {
	pres, err := parseTeX(`\DeclareMathOperator{\argmax}{argmax}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Macros[`\argmax`] != `\operatorname{argmax}` {
		t.Errorf("expected \\argmax = '\\operatorname{argmax}', got %q", pres.Macros[`\argmax`])
	}
}

func TestParser_DeclareMathOperatorStar(t *testing.T) {
	pres, err := parseTeX(`\DeclareMathOperator*{\argmin}{argmin}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Macros[`\argmin`] != `\operatorname*{argmin}` {
		t.Errorf("expected \\argmin = '\\operatorname*{argmin}', got %q", pres.Macros[`\argmin`])
	}
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

func TestParser_Section(t *testing.T) {
	pres, err := parseTeX(`\section{Introduction}`)
	if err != nil {
		t.Fatal(err)
	}
	if len(pres.Sections) != 1 {
		t.Fatalf("expected 1 section, got %d", len(pres.Sections))
	}
	if pres.Sections[0].Title != "Introduction" {
		t.Errorf("expected section 'Introduction', got %q", pres.Sections[0].Title)
	}
}

func TestParser_SectionSlideIndex(t *testing.T) {
	pres, err := parseTeX(`
\section{First}
\begin{frame}{Slide 1}\end{frame}
\begin{frame}{Slide 2}\end{frame}
\section{Second}
\begin{frame}{Slide 3}\end{frame}
`)
	if err != nil {
		t.Fatal(err)
	}
	if len(pres.Sections) != 2 {
		t.Fatalf("expected 2 sections, got %d", len(pres.Sections))
	}
	if pres.Sections[0].SlideIndex != 0 {
		t.Errorf("expected first section slideIndex=0, got %d", pres.Sections[0].SlideIndex)
	}
	if pres.Sections[1].SlideIndex != 2 {
		t.Errorf("expected second section slideIndex=2, got %d", pres.Sections[1].SlideIndex)
	}
}

func TestParser_FrameSectionPropagation(t *testing.T) {
	pres, err := parseTeX(`
\section{Intro}
\begin{frame}{First frame}\end{frame}
`)
	if err != nil {
		t.Fatal(err)
	}
	if len(pres.Frames) == 0 {
		t.Fatal("expected 1 frame")
	}
	if pres.Frames[0].Section != "Intro" {
		t.Errorf("expected frame.Section='Intro', got %q", pres.Frames[0].Section)
	}
}

// ---------------------------------------------------------------------------
// Frames
// ---------------------------------------------------------------------------

func TestParser_EmptyPresentation(t *testing.T) {
	pres, err := parseTeX("")
	if err != nil {
		t.Fatal(err)
	}
	if len(pres.Frames) != 0 {
		t.Errorf("expected 0 frames for empty input, got %d", len(pres.Frames))
	}
}

func TestParser_FrameTitle(t *testing.T) {
	pres, err := parseTeX(`\begin{frame}{Hello World}\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	if len(pres.Frames) != 1 {
		t.Fatalf("expected 1 frame, got %d", len(pres.Frames))
	}
	if pres.Frames[0].Title != "Hello World" {
		t.Errorf("expected title 'Hello World', got %q", pres.Frames[0].Title)
	}
}

func TestParser_FrameTitleSubtitle(t *testing.T) {
	pres, err := parseTeX(`\begin{frame}{Main}{Sub}\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Frames[0].Title != "Main" {
		t.Errorf("expected title 'Main', got %q", pres.Frames[0].Title)
	}
	if pres.Frames[0].Subtitle != "Sub" {
		t.Errorf("expected subtitle 'Sub', got %q", pres.Frames[0].Subtitle)
	}
}

func TestParser_FrameTitleCommand(t *testing.T) {
	pres, err := parseTeX(`
\begin{frame}
\frametitle{Dynamic Title}
\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Frames[0].Title != "Dynamic Title" {
		t.Errorf("expected title 'Dynamic Title', got %q", pres.Frames[0].Title)
	}
}

func TestParser_FrameTitleWithTexttt(t *testing.T) {
	// \texttt{\textbackslash pause} inside frame title must resolve to \pause,
	// not stop at the inner } and expose raw token values.
	pres, err := parseTeX(`\begin{frame}{Step-by-Step with \texttt{\textbackslash pause}}\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	want := `Step-by-Step with \pause`
	if pres.Frames[0].Title != want {
		t.Errorf("expected title %q, got %q", want, pres.Frames[0].Title)
	}
}

func TestParser_FrameTitleWithTextSpecials(t *testing.T) {
	// \texttt{\textbackslash only\textless step\textgreater\{...\}} must
	// resolve the escapes and track nested braces correctly.
	pres, err := parseTeX(`\begin{frame}{\texttt{\textbackslash only\textless step\textgreater\{...\}}}\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	want := `\only<step>{...}`
	if pres.Frames[0].Title != want {
		t.Errorf("expected title %q, got %q", want, pres.Frames[0].Title)
	}
}

func TestParser_FrameTitleViaCmdWithTexttt(t *testing.T) {
	// Same scenario but using \frametitle instead of the frame argument.
	pres, err := parseTeX(`
\begin{frame}
\frametitle{Step-by-Step with \texttt{\textbackslash pause}}
\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	want := `Step-by-Step with \pause`
	if pres.Frames[0].Title != want {
		t.Errorf("expected title %q, got %q", want, pres.Frames[0].Title)
	}
}

func TestParser_TitlePageFrame(t *testing.T) {
	pres, err := parseTeX(`
\begin{frame}
\titlepage
\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	if !pres.Frames[0].TitlePage {
		t.Error("expected titlePage=true")
	}
}

func TestParser_PlainFrame(t *testing.T) {
	pres, err := parseTeX(`\begin{frame}[plain]{}\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	if !pres.Frames[0].Plain {
		t.Error("expected plain=true")
	}
}

func TestParser_MultipleFrames(t *testing.T) {
	pres, err := parseTeX(`
\begin{frame}{One}\end{frame}
\begin{frame}{Two}\end{frame}
\begin{frame}{Three}\end{frame}
`)
	if err != nil {
		t.Fatal(err)
	}
	if len(pres.Frames) != 3 {
		t.Errorf("expected 3 frames, got %d", len(pres.Frames))
	}
}

func TestParser_FrameNotes(t *testing.T) {
	pres, err := parseTeX(`
\begin{frame}{Notes}
\note{Speaker note here}
\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(pres.Frames[0].Notes, "Speaker note here") {
		t.Errorf("expected notes to contain 'Speaker note here', got %q", pres.Frames[0].Notes)
	}
}

func TestParser_FrameMaxStepsWithPause(t *testing.T) {
	pres, err := parseTeX(`
\begin{frame}{Paused}
First
\pause
Second
\pause
Third
\end{frame}`)
	if err != nil {
		t.Fatal(err)
	}
	if pres.Frames[0].MaxSteps < 3 {
		t.Errorf("expected MaxSteps >= 3 with 2 pauses, got %d", pres.Frames[0].MaxSteps)
	}
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

func TestParser_DefineColorHTML(t *testing.T) {
	l := NewLexer(`\definecolor{myblue}{HTML}{003366}`)
	p := NewParser(l, "")
	p.ParsePresentation()
	if p.namedColors == nil || p.namedColors["myblue"] != "#003366" {
		t.Errorf("expected namedColors[myblue]='#003366', got %v", p.namedColors)
	}
}

func TestParser_DefineColorRGB(t *testing.T) {
	l := NewLexer(`\definecolor{mygray}{rgb}{0.5,0.5,0.5}`)
	p := NewParser(l, "")
	p.ParsePresentation()
	if p.namedColors == nil || p.namedColors["mygray"] == "" {
		t.Errorf("expected mygray to be defined, got %v", p.namedColors)
	}
	if !strings.HasPrefix(p.namedColors["mygray"], "rgb(") {
		t.Errorf("expected rgb(...) format, got %q", p.namedColors["mygray"])
	}
}

func TestParser_Colorlet(t *testing.T) {
	l := NewLexer(`
\definecolor{primary}{HTML}{FF0000}
\colorlet{highlight}{primary}
`)
	p := NewParser(l, "")
	p.ParsePresentation()
	if p.namedColors["highlight"] != "#ff0000" {
		t.Errorf("expected highlight='#ff0000', got %q", p.namedColors["highlight"])
	}
}

// ---------------------------------------------------------------------------
// BibResources
// ---------------------------------------------------------------------------

func TestParser_AddBibresource(t *testing.T) {
	pres, err := parseTeX(`\addbibresource{refs.bib}`)
	if err != nil {
		t.Fatal(err)
	}
	if len(pres.BibResources) == 0 || pres.BibResources[0] != "refs.bib" {
		t.Errorf("expected BibResources=['refs.bib'], got %v", pres.BibResources)
	}
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

func TestOverlayMaxStep_Empty(t *testing.T) {
	if overlayMaxStep("") != 0 {
		t.Error("expected 0 for empty overlay")
	}
}

func TestOverlayMaxStep_SingleNumber(t *testing.T) {
	if got := overlayMaxStep("3"); got != 3 {
		t.Errorf("expected 3, got %d", got)
	}
}

func TestOverlayMaxStep_Range(t *testing.T) {
	if got := overlayMaxStep("2-5"); got != 5 {
		t.Errorf("expected 5 for '2-5', got %d", got)
	}
}

func TestOverlayMaxStep_OpenRange(t *testing.T) {
	if got := overlayMaxStep("2-"); got != 2 {
		t.Errorf("expected 2 for '2-', got %d", got)
	}
}

func TestOverlayMaxStep_CommaList(t *testing.T) {
	if got := overlayMaxStep("1,3,5"); got != 5 {
		t.Errorf("expected 5 for '1,3,5', got %d", got)
	}
}

func TestMaxStepsFromContent_NoOverlay(t *testing.T) {
	c := Content{Type: ContentRichText}
	if got := maxStepsFromContent(c); got != 0 {
		t.Errorf("expected 0, got %d", got)
	}
}

func TestMaxStepsFromContent_WithOverlay(t *testing.T) {
	c := Content{
		Type:    ContentRichText,
		Overlay: "1-3",
	}
	if got := maxStepsFromContent(c); got != 3 {
		t.Errorf("expected 3, got %d", got)
	}
}

func TestMaxStepsFromContent_Nested(t *testing.T) {
	c := Content{
		Type:    ContentList,
		Overlay: "1",
		Children: []Content{
			{Type: ContentRichText, Overlay: "2-4"},
		},
	}
	if got := maxStepsFromContent(c); got != 4 {
		t.Errorf("expected 4 from nested overlay, got %d", got)
	}
}

func TestMaxStepsFromContent_InlineOverlay(t *testing.T) {
	c := Content{
		Type: ContentRichText,
		Inline: []InlineContent{
			{Type: InlinePureText, Value: "x", Overlay: "1-2"},
			{Type: InlinePureText, Value: "y", Overlay: "3"},
		},
	}
	if got := maxStepsFromContent(c); got != 3 {
		t.Errorf("expected 3 from inline overlays, got %d", got)
	}
}

// ---------------------------------------------------------------------------
// Custom code environments
// ---------------------------------------------------------------------------

func TestParser_Newtcblisting(t *testing.T) {
	l := NewLexer(`\newtcblisting{mycode}[1]{listing options={language=python}}`)
	p := NewParser(l, "")
	p.ParsePresentation()
	if p.customCodeEnvs == nil {
		t.Fatal("expected customCodeEnvs to be set")
	}
	info, ok := p.customCodeEnvs["mycode"]
	if !ok {
		t.Fatal("expected 'mycode' in customCodeEnvs")
	}
	if info.lang != "python" {
		t.Errorf("expected lang='python', got %q", info.lang)
	}
}

// ---------------------------------------------------------------------------
// Inline formatting
// ---------------------------------------------------------------------------

// firstInline returns the inline elements from the first richtext content node
// of the first frame, to make inline-parsing assertions concise.
func firstInline(t *testing.T, src string) []InlineContent {
	t.Helper()
	pres, err := parseTeX(src)
	if err != nil {
		t.Fatalf("parse error: %v", err)
	}
	if len(pres.Frames) == 0 {
		t.Fatal("no frames produced")
	}
	for _, c := range pres.Frames[0].Content {
		if c.Type == ContentRichText && len(c.Inline) > 0 {
			return c.Inline
		}
	}
	t.Fatal("no richtext content with inline elements found")
	return nil
}

func TestParser_InlineBold(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\textbf{hello}\end{frame}`)
	if inline[0].Type != InlineBold || inline[0].Value != "hello" {
		t.Errorf("expected bold 'hello', got type=%s value=%q", inline[0].Type, inline[0].Value)
	}
}

func TestParser_InlineItalic(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\textit{world}\end{frame}`)
	if inline[0].Type != InlineItalic || inline[0].Value != "world" {
		t.Errorf("expected italic 'world', got type=%s value=%q", inline[0].Type, inline[0].Value)
	}
}

func TestParser_InlineEmph(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\emph{emphasis}\end{frame}`)
	if inline[0].Type != InlineItalic || inline[0].Value != "emphasis" {
		t.Errorf("expected italic for \\emph, got type=%s value=%q", inline[0].Type, inline[0].Value)
	}
}

func TestParser_InlineTexttt(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\texttt{slitex}\end{frame}`)
	if inline[0].Type != InlineCode || inline[0].Value != "slitex" {
		t.Errorf("expected code 'slitex', got type=%s value=%q", inline[0].Type, inline[0].Value)
	}
}

func TestParser_InlineTextttBackslash(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\texttt{\textbackslash pause}\end{frame}`)
	if inline[0].Type != InlineCode {
		t.Fatalf("expected code type, got %s", inline[0].Type)
	}
	if inline[0].Value != `\pause` {
		t.Errorf("expected '\\pause', got %q", inline[0].Value)
	}
}

func TestParser_InlineTextttNestedBraces(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\texttt{\textbackslash usetheme\{Madrid\}}\end{frame}`)
	if inline[0].Type != InlineCode {
		t.Fatalf("expected code type, got %s", inline[0].Type)
	}
	if inline[0].Value != `\usetheme{Madrid}` {
		t.Errorf("expected '\\usetheme{Madrid}', got %q", inline[0].Value)
	}
}

func TestParser_InlineAlert(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\alert{danger}\end{frame}`)
	if inline[0].Type != InlineAlert || inline[0].Value != "danger" {
		t.Errorf("expected alert 'danger', got type=%s value=%q", inline[0].Type, inline[0].Value)
	}
}

func TestParser_InlineTextcolor(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\textcolor{red}{colored}\end{frame}`)
	if inline[0].Type != InlineColored {
		t.Errorf("expected colored, got type=%s", inline[0].Type)
	}
	if inline[0].Value != "colored" {
		t.Errorf("expected value 'colored', got %q", inline[0].Value)
	}
}

func TestParser_InlineTextcolorNamedColor(t *testing.T) {
	src := `
\definecolor{myblue}{HTML}{1D4ED8}
\begin{frame}{F}\textcolor{myblue}{blue text}\end{frame}
`
	inline := firstInline(t, src)
	if inline[0].Type != InlineColored {
		t.Errorf("expected colored, got type=%s", inline[0].Type)
	}
	if inline[0].Color != "#1d4ed8" {
		t.Errorf("expected resolved color '#1d4ed8', got %q", inline[0].Color)
	}
}

func TestParser_InlineURL(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\url{https://example.com}\end{frame}`)
	if inline[0].Type != InlineURL {
		t.Fatalf("expected url, got type=%s", inline[0].Type)
	}
	if inline[0].Value != "https://example.com" {
		t.Errorf("expected url value 'https://example.com', got %q", inline[0].Value)
	}
}

func TestParser_InlineHref(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\href{https://example.com}{Click here}\end{frame}`)
	if inline[0].Type != InlineURL {
		t.Fatalf("expected url, got type=%s", inline[0].Type)
	}
	if inline[0].Value != "Click here" {
		t.Errorf("expected label 'Click here', got %q", inline[0].Value)
	}
	if inline[0].Color != "https://example.com" {
		t.Errorf("expected href 'https://example.com', got %q", inline[0].Color)
	}
}

func TestParser_InlineEnquote(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}\enquote{quoted}\end{frame}`)
	combined := ""
	for _, el := range inline {
		combined += el.Value
	}
	if !strings.Contains(combined, "quoted") {
		t.Errorf("expected 'quoted' in inline content, got %q", combined)
	}
	if !strings.Contains(combined, "\u201C") || !strings.Contains(combined, "\u201D") {
		t.Errorf("expected curly quotes around enquoted text, got %q", combined)
	}
}

func TestParser_InlineMixedFormatting(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}Run \texttt{slitex serve} to start.\end{frame}`)
	foundCode := false
	for _, el := range inline {
		if el.Type == InlineCode && el.Value == "slitex serve" {
			foundCode = true
		}
	}
	if !foundCode {
		t.Errorf("expected InlineCode 'slitex serve' among inline elements: %v", inline)
	}
}

func TestParser_InlineInlineMath(t *testing.T) {
	inline := firstInline(t, `\begin{frame}{F}Value $x^2$ here.\end{frame}`)
	foundMath := false
	for _, el := range inline {
		if el.Type == InlineMathMode && strings.Contains(el.Value, "x^2") {
			foundMath = true
		}
	}
	if !foundMath {
		t.Errorf("expected inline math containing 'x^2': %v", inline)
	}
}

// ---------------------------------------------------------------------------
// Panic recovery
// ---------------------------------------------------------------------------

func TestParser_PanicRecovery(t *testing.T) {
	// Malformed but should not panic — error is returned instead
	_, err := parseTeX(`\begin{frame}{Unclosed`)
	// Either a nil error (parser recovered gracefully) or a proper error is fine
	_ = err
}
