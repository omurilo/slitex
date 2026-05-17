package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/omurilo/slitex/internal/compiler"
	"github.com/omurilo/slitex/internal/ui"

	"github.com/fsnotify/fsnotify"
)

type SyncState struct {
	Slide int `json:"slide"`
	Step  int `json:"step"`
}

type DevServer struct {
	targetFile string
	mu         sync.Mutex
	clients    map[chan string]bool
	syncState  SyncState
}

func NewDevServer(targetFile string) *DevServer {
	return &DevServer{
		targetFile: targetFile,
		clients:    make(map[chan string]bool),
		syncState:  SyncState{Slide: 0, Step: 1},
	}
}

func (s *DevServer) broadcast(msg string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for ch := range s.clients {
		select {
		case ch <- msg:
		default:
		}
	}
}

func (s *DevServer) sseHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	messageChan := make(chan string, 8)

	s.mu.Lock()
	s.clients[messageChan] = true
	stateJSON, _ := json.Marshal(map[string]interface{}{
		"type":  "sync",
		"slide": s.syncState.Slide,
		"step":  s.syncState.Step,
	})
	s.mu.Unlock()

	fmt.Fprintf(w, "data: %s\n\n", stateJSON)
	w.(http.Flusher).Flush()

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
		case msg, ok := <-messageChan:
			if !ok {
				return
			}
			fmt.Fprintf(w, "data: %s\n\n", msg)
			w.(http.Flusher).Flush()
		}
	}
}

func (s *DevServer) syncHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method == http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		s.mu.Lock()
		state := s.syncState
		s.mu.Unlock()
		json.NewEncoder(w).Encode(state)
		return
	}

	if r.Method == http.MethodPost {
		var state SyncState
		if err := json.NewDecoder(r.Body).Decode(&state); err != nil {
			http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
			return
		}
		s.mu.Lock()
		s.syncState = state
		s.mu.Unlock()

		msg, _ := json.Marshal(map[string]interface{}{
			"type":  "sync",
			"slide": state.Slide,
			"step":  state.Step,
		})
		s.broadcast(string(msg))

		w.WriteHeader(http.StatusNoContent)
		return
	}

	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
}

func (s *DevServer) apiASTHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	content, err := os.ReadFile(s.targetFile)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	baseDir := filepath.Dir(s.targetFile)

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

	const parseTimeout = 10 * time.Second
	var presentation *compiler.Presentation
	select {
	case res := <-ch:
		if res.err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Erro de parsing: %v"}`, res.err), http.StatusBadRequest)
			return
		}
		presentation = res.pres
	case <-time.After(parseTimeout):
		http.Error(w, `{"error": "Timeout: a geração da AST demorou mais que o esperado. Verifique se há ambientes LaTeX não fechados ou não suportados."}`, http.StatusBadRequest)
		return
	}

	for _, res := range presentation.BibResources {
		bibPath := resolveBibPath(res, baseDir)
		if bibPath == "" {
			continue
		}
		bibContent, err := os.ReadFile(bibPath)
		if err != nil {
			continue
		}
		entries := compiler.ParseBibTeX(string(bibContent))
		presentation.Bibliography = append(presentation.Bibliography, entries...)
	}

	json.NewEncoder(w).Encode(presentation)
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
					s.broadcast("reload")
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

func (s *DevServer) themeHandler() http.Handler {
	baseDir := filepath.Dir(s.targetFile)
	localThemesDir := filepath.Join(baseDir, "themes")

	localFS := http.FileServer(http.Dir(localThemesDir))
	npmFS := http.FileServer(http.Dir("./node_modules"))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cleanedURL := path.Clean("/" + r.URL.Path)
		candidate := filepath.Join(localThemesDir, filepath.FromSlash(cleanedURL))

		absDir, _ := filepath.Abs(localThemesDir)
		absCandidate, _ := filepath.Abs(candidate)
		if strings.HasPrefix(absCandidate, absDir+string(filepath.Separator)) {
			if _, err := os.Stat(absCandidate); err == nil {
				localFS.ServeHTTP(w, r)
				return
			}
		}

		npmFS.ServeHTTP(w, r)
	})
}

func (s *DevServer) Start(port string) error {
	go s.watchFile()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/ast", s.apiASTHandler)
	mux.HandleFunc("/api/live", s.sseHandler)
	mux.HandleFunc("/api/sync", s.syncHandler)

	mux.Handle("/themes/external/", http.StripPrefix("/themes/external/", s.themeHandler()))

	texDir := filepath.Dir(s.targetFile)
	mux.Handle("/files/", http.StripPrefix("/files/", http.FileServer(http.Dir(texDir))))

	reactUI := ui.GetFileSystem()
	fileServer := http.FileServer(reactUI)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		f, err := reactUI.Open(r.URL.Path)
		if err != nil {
			r.URL.Path = "/"
		} else {
			f.Close()
		}
		fileServer.ServeHTTP(w, r)
	})

	log.Printf("🚀 slitex V1 ativo em http://localhost:%s", port)
	return http.ListenAndServe(":"+port, mux)
}
