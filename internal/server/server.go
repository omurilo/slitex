package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/omurilo/lslide/internal/compiler"
	"github.com/omurilo/lslide/internal/ui"

	"github.com/fsnotify/fsnotify"
)

type DevServer struct {
	targetFile string
	mu         sync.Mutex
	clients    map[chan bool]bool
}

func NewDevServer(targetFile string) *DevServer {
	return &DevServer{
		targetFile: targetFile,
		clients:    make(map[chan bool]bool),
	}
}

func (s *DevServer) sseHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	messageChan := make(chan bool)

	s.mu.Lock()
	s.clients[messageChan] = true
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		delete(s.clients, messageChan)
		s.mu.Unlock()
		close(messageChan)
	}()

	notify := r.Context().Done()

	for {
		select {
		case <-notify:
			return
		case <-messageChan:
			fmt.Fprintf(w, "data: reload\n\n")
			w.(http.Flusher).Flush()
		}
	}
}

func (s *DevServer) apiASTHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	content, err := os.ReadFile(s.targetFile)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	lexer := compiler.NewLexer(string(content))
	parser := compiler.NewParser(lexer)

	presentation, err := parser.ParsePresentation()
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Erro de parsing: %v"}`, err), http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(presentation)
}

func (s *DevServer) watchFile() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("Erro ao criar watcher: %v", err)
	}
	defer watcher.Close()

	err = watcher.Add(s.targetFile)
	if err != nil {
		log.Fatalf("Erro ao monitorar arquivo: %v", err)
	}

	var lastEventTime time.Time

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Has(fsnotify.Write) {
				if time.Since(lastEventTime) > 100*time.Millisecond {
					lastEventTime = time.Now()
					log.Printf("Arquivo [%s] modificado. Atualizando clients...", s.targetFile)

					s.mu.Lock()
					for clientChan := range s.clients {
						clientChan <- true
					}
					s.mu.Unlock()
				}
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Printf("Erro no watcher: %v", err)
		}
	}
}

func (s *DevServer) Start(port string) error {
	go s.watchFile()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/ast", s.apiASTHandler)
	mux.HandleFunc("/api/live", s.sseHandler)

	// Permite que o Go sirva plugins e pacotes externos instalados no escopo do usuário
	mux.Handle("/themes/external/", http.StripPrefix("/themes/external/", http.FileServer(http.Dir("./node_modules"))))

	// Captura os assets estáticos do React embutidos via go:embed
	reactUI := ui.GetFileSystem()
	fileServer := http.FileServer(reactUI)

	// Fallback para SPA (Single Page Application): Se a rota não for um arquivo físico (ex: /presenter ou /projector),
	// serve o index.html do React para o roteador interno resolver o estado visual.
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Abre o arquivo requisitado no sistema de arquivos embutido
		f, err := reactUI.Open(r.URL.Path)
		if err != nil {
			// Se o arquivo não existir, força a entrega do index.html (mecanismo SPA)
			r.URL.Path = "/"
		} else {
			f.Close()
		}
		fileServer.ServeHTTP(w, r)
	})

	log.Printf("🚀 lslide V1 ativo em http://localhost:%s", port)
	return http.ListenAndServe(":"+port, mux)
}
