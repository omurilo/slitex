package ui

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed dist/*
var embedFS embed.FS

// GetFileSystem retorna o sistema de arquivos embutido apontando para a raiz do build do React
func GetFileSystem() http.FileSystem {
	// Como o go:embed inclui o prefixo "dist", usamos fs.Sub para extrair apenas o conteúdo interno
	fsys, err := fs.Sub(embedFS, "dist")
	if err != nil {
		panic("Falha catastrófica ao ler arquivos embutidos da UI: " + err.Error())
	}
	return http.FS(fsys)
}
