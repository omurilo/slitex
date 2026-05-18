package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"runtime"
	"time"

	"github.com/omurilo/slitex/internal/builder"
	"github.com/omurilo/slitex/internal/printer"
	"github.com/omurilo/slitex/internal/server"
)

func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("sistema operacional não suportado para auto-open")
	}
	if err != nil {
		log.Printf("Não foi possível abrir o navegador automaticamente: %v", err)
	}
}

func usage() {
	fmt.Fprintf(os.Stderr, `Uso: slitex <comando> [opções] <arquivo.tex>

Comandos:
  serve   Inicia o servidor de desenvolvimento (padrão quando nenhum comando é fornecido)
  build   Gera um site estático pronto para distribuição
  print   Gera um PDF da apresentação usando um navegador headless

Opções de serve:
  -port string   Porta para o servidor de desenvolvimento (padrão: 3000)

Opções de build:
  -o string      Diretório de saída (padrão: dist/ ao lado do .tex)

Opções de print:
  -o string      Arquivo PDF de saída (padrão: <nome>.pdf ao lado do .tex)

Exemplos:
  slitex serve presentation.tex
  slitex serve -port=8080 presentation.tex
  slitex build presentation.tex
  slitex build -o ./public presentation.tex
  slitex print presentation.tex
  slitex print -o slides.pdf presentation.tex
`)
}

func main() {
	flag.Usage = usage

	if len(os.Args) < 2 {
		usage()
		os.Exit(1)
	}

	// Detect command: if first arg looks like a flag or a file, assume "serve".
	cmd := os.Args[1]
	var cmdArgs []string

	switch cmd {
	case "serve", "build", "print":
		cmdArgs = os.Args[2:]
	default:
		// Backwards-compatible: treat entire args as "serve" args.
		cmd = "serve"
		cmdArgs = os.Args[1:]
	}

	switch cmd {
	case "serve":
		runServe(cmdArgs)
	case "build":
		runBuild(cmdArgs)
	case "print":
		runPrint(cmdArgs)
	default:
		usage()
		os.Exit(1)
	}
}

func runServe(args []string) {
	fs := flag.NewFlagSet("serve", flag.ExitOnError)
	port := fs.String("port", "3000", "Porta para rodar o servidor de desenvolvimento")
	fs.Usage = usage
	fs.Parse(args)

	remaining := fs.Args()
	if len(remaining) < 1 {
		log.Fatalf("Uso correto: slitex serve [-port=3000] <arquivo.tex>")
	}

	targetFile := remaining[0]
	if _, err := os.Stat(targetFile); os.IsNotExist(err) {
		log.Fatalf("Erro: O arquivo de entrada '%s' não existe.", targetFile)
	}

	srv := server.NewDevServer(targetFile)

	go func() {
		time.Sleep(200 * time.Millisecond)
		openBrowser("http://localhost:" + *port)
	}()

	if err := srv.Start(*port); err != nil {
		log.Fatalf("Falha crítica no servidor: %v", err)
	}
}

func runBuild(args []string) {
	fs := flag.NewFlagSet("build", flag.ExitOnError)
	output := fs.String("o", "", "Diretório de saída (padrão: dist/ ao lado do .tex)")
	fs.Usage = usage
	fs.Parse(args)

	remaining := fs.Args()
	if len(remaining) < 1 {
		log.Fatalf("Uso correto: slitex build [-o <dir>] <arquivo.tex>")
	}

	texFile := remaining[0]
	if err := builder.Build(texFile, *output); err != nil {
		log.Fatalf("Erro no build: %v", err)
	}
}

func runPrint(args []string) {
	fs := flag.NewFlagSet("print", flag.ExitOnError)
	output := fs.String("o", "", "Arquivo PDF de saída (padrão: <nome>.pdf ao lado do .tex)")
	fs.Usage = usage
	fs.Parse(args)

	remaining := fs.Args()
	if len(remaining) < 1 {
		log.Fatalf("Uso correto: slitex print [-o <arquivo.pdf>] <arquivo.tex>")
	}

	texFile := remaining[0]
	if err := printer.Print(texFile, *output); err != nil {
		log.Fatalf("Erro ao gerar PDF: %v", err)
	}
}
