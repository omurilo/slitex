package builder

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/omurilo/slitex/internal/compiler"
	"github.com/omurilo/slitex/internal/ui"
)

func Build(texFile, outputDir string) error {
	absTexFile, err := filepath.Abs(texFile)
	if err != nil {
		return fmt.Errorf("resolving tex file path: %w", err)
	}

	if _, err := os.Stat(absTexFile); os.IsNotExist(err) {
		return fmt.Errorf("arquivo .tex não encontrado: %s", absTexFile)
	}

	baseDir := filepath.Dir(absTexFile)

	if outputDir == "" {
		outputDir = filepath.Join(baseDir, "dist")
	}

	absOut, err := filepath.Abs(outputDir)
	if err != nil {
		return fmt.Errorf("resolving output path: %w", err)
	}

	log.Printf("📦 Building static site → %s", absOut)

	presentation, err := parsePresentation(absTexFile, baseDir)
	if err != nil {
		return fmt.Errorf("parsing presentation: %w", err)
	}

	if err := os.MkdirAll(absOut, 0755); err != nil {
		return fmt.Errorf("creating output directory: %w", err)
	}

	if err := extractUI(absOut); err != nil {
		return fmt.Errorf("extracting UI: %w", err)
	}

	indexHTML, err := buildIndexHTML(presentation)
	if err != nil {
		return fmt.Errorf("building index.html: %w", err)
	}

	if err := os.WriteFile(filepath.Join(absOut, "index.html"), indexHTML, 0644); err != nil {
		return fmt.Errorf("writing index.html: %w", err)
	}

	// 5. Copy image/file assets referenced in the presentation.
	if err := copyPresentationFiles(presentation, baseDir, absOut); err != nil {
		return fmt.Errorf("copying presentation files: %w", err)
	}

	log.Printf("✅ Build concluído: %s", absOut)
	return nil
}

func parsePresentation(texFile, baseDir string) (*compiler.Presentation, error) {
	content, err := os.ReadFile(texFile)
	if err != nil {
		return nil, err
	}

	type result struct {
		pres *compiler.Presentation
		err  error
	}
	ch := make(chan result, 1)
	go func() {
		lexer := compiler.NewLexer(string(content))
		parser := compiler.NewParser(lexer, baseDir)
		pres, err := parser.ParsePresentation()
		ch <- result{pres, err}
	}()

	select {
	case res := <-ch:
		if res.err != nil {
			return nil, res.err
		}
		pres := res.pres
		for _, res := range pres.BibResources {
			bibPath := resolveBibPath(res, baseDir)
			if bibPath == "" {
				continue
			}
			bibContent, err := os.ReadFile(bibPath)
			if err != nil {
				continue
			}
			entries := compiler.ParseBibTeX(string(bibContent))
			pres.Bibliography = append(pres.Bibliography, entries...)
		}
		return pres, nil
	case <-time.After(30 * time.Second):
		return nil, fmt.Errorf("timeout parsing presentation")
	}
}

func extractUI(outputDir string) error {
	uiFS := ui.GetEmbedFS()

	return fs.WalkDir(uiFS, "dist", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		rel := strings.TrimPrefix(path, "dist/")
		if rel == "dist" || rel == "" {
			return nil
		}

		dest := filepath.Join(outputDir, rel)

		if d.IsDir() {
			return os.MkdirAll(dest, 0755)
		}

		if path == "dist/index.html" {
			return nil
		}

		return copyEmbeddedFile(uiFS, path, dest)
	})
}

func copyEmbeddedFile(uiFS fs.FS, src, dest string) error {
	if err := os.MkdirAll(filepath.Dir(dest), 0755); err != nil {
		return err
	}
	f, err := uiFS.Open(src)
	if err != nil {
		return err
	}
	defer f.Close()

	out, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, f)
	return err
}

func buildIndexHTML(pres *compiler.Presentation) ([]byte, error) {
	uiFS := ui.GetEmbedFS()

	f, err := uiFS.Open("dist/index.html")
	if err != nil {
		return nil, err
	}
	defer f.Close()

	raw, err := io.ReadAll(f)
	if err != nil {
		return nil, err
	}

	astJSON, err := json.Marshal(pres)
	if err != nil {
		return nil, fmt.Errorf("marshaling AST: %w", err)
	}

	injection := fmt.Sprintf(
		`<script>window.__SLITEX_STATIC__=true;window.__SLITEX_AST__=%s;</script>`,
		string(astJSON),
	)

	modified := raw

	if pres.Title != "" {
		modified = bytes.Replace(modified, []byte("<title>web</title>"),
			[]byte("<title>"+pres.Title+"</title>"), 1)
	}

	modified = bytes.Replace(modified, []byte("</head>"), []byte(injection+"</head>"), 1)
	if bytes.Equal(modified, raw) {
		modified = bytes.Replace(modified, []byte("<script"), []byte(injection+"<script"), 1)
	}

	return modified, nil
}

func copyPresentationFiles(pres *compiler.Presentation, baseDir, outputDir string) error {
	filesDir := filepath.Join(outputDir, "files")

	for _, frame := range pres.Frames {
		if err := collectContentFiles(frame.Content, baseDir, filesDir); err != nil {
			return err
		}
	}
	return nil
}

func collectContentFiles(contents []compiler.Content, baseDir, filesDir string) error {
	for _, c := range contents {
		if c.Type == compiler.ContentImage && c.Path != "" {
			if err := copyFileToDir(c.Path, baseDir, filesDir); err != nil {
				log.Printf("⚠️  Não foi possível copiar imagem '%s': %v", c.Path, err)
			}
		}
		if len(c.Children) > 0 {
			if err := collectContentFiles(c.Children, baseDir, filesDir); err != nil {
				return err
			}
		}
	}
	return nil
}

func copyFileToDir(relPath, baseDir, filesDir string) error {
	srcPath := filepath.Join(baseDir, relPath)
	destPath := filepath.Join(filesDir, relPath)

	absFilesDir, _ := filepath.Abs(filesDir)
	absDestPath, _ := filepath.Abs(destPath)
	if !strings.HasPrefix(absDestPath, absFilesDir+string(filepath.Separator)) {
		return fmt.Errorf("path traversal detectado: %s", relPath)
	}

	if _, err := os.Stat(srcPath); os.IsNotExist(err) {
		return fmt.Errorf("arquivo não encontrado: %s", srcPath)
	}

	if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
		return err
	}

	src, err := os.Open(srcPath)
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	return err
}

func resolveBibPath(resource, baseDir string) string {
	candidates := []string{
		filepath.Join(baseDir, resource),
		filepath.Join(baseDir, resource+".bib"),
		filepath.Join(baseDir, "templates", resource),
		filepath.Join(baseDir, "templates", resource+".bib"),
	}
	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			return c
		}
	}
	return ""
}
