package ui

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed dist/*
var embedFS embed.FS

func GetFileSystem() http.FileSystem {
	fsys, err := fs.Sub(embedFS, "dist")
	if err != nil {
		panic("Falha catastrófica ao ler arquivos embutidos da UI: " + err.Error())
	}
	return http.FS(fsys)
}
