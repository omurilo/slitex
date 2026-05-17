package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"runtime"
	"time"

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

func main() {
	port := flag.String("port", "3000", "Porta para rodar o servidor de desenvolvimento")
	flag.Parse()

	args := flag.Args()
	if len(args) < 1 {
		log.Fatalf("Uso correto: slitex [-port=3000] <arquivo.tex>")
	}

	targetFile := args[0]

	if _, err := os.Stat(targetFile); os.IsNotExist(err) {
		log.Fatalf("Erro: O arquivo de entrada '%s' não existe.", targetFile)
	}

	srv := server.NewDevServer(targetFile)

	// Dispara o navegador um instante após a subida do listen do servidor
	go func() {
		time.Sleep(200 * time.Millisecond)
		openBrowser("http://localhost:" + *port)
	}()

	if err := srv.Start(*port); err != nil {
		log.Fatalf("Falha crítica no servidor: %v", err)
	}
}
