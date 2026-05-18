package printer

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
	"github.com/omurilo/slitex/internal/server"
)

func Print(texFile, outputFile string) error {
	absTexFile, err := filepath.Abs(texFile)
	if err != nil {
		return fmt.Errorf("resolving tex file path: %w", err)
	}

	if _, err := os.Stat(absTexFile); os.IsNotExist(err) {
		return fmt.Errorf("arquivo .tex não encontrado: %s", absTexFile)
	}

	if outputFile == "" {
		base := filepath.Base(absTexFile)
		ext := filepath.Ext(base)
		outputFile = filepath.Join(filepath.Dir(absTexFile), base[:len(base)-len(ext)]+".pdf")
	}

	absOutput, err := filepath.Abs(outputFile)
	if err != nil {
		return fmt.Errorf("resolving output path: %w", err)
	}

	port, err := freePort()
	if err != nil {
		return fmt.Errorf("finding free port: %w", err)
	}

	log.Printf("🖨️  Iniciando servidor temporário na porta %d...", port)

	srv := server.NewDevServer(absTexFile)

	errCh := make(chan error, 1)
	httpSrv := &http.Server{Addr: fmt.Sprintf(":%d", port)}
	go func() {
		errCh <- srv.StartWithServer(httpSrv)
	}()

	if err := waitForServer(fmt.Sprintf("http://localhost:%d", port), 10*time.Second); err != nil {
		_ = httpSrv.Close()
		return fmt.Errorf("servidor não ficou pronto: %w", err)
	}

	printURL := fmt.Sprintf("http://localhost:%d/print", port)
	log.Printf("🌐 Renderizando %s ...", printURL)

	pdfData, err := renderPDF(printURL)

	shutCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = httpSrv.Shutdown(shutCtx)

	if err != nil {
		return fmt.Errorf("gerando PDF: %w", err)
	}

	if err := os.WriteFile(absOutput, pdfData, 0644); err != nil {
		return fmt.Errorf("salvando PDF: %w", err)
	}

	log.Printf("✅ PDF gerado: %s", absOutput)
	return nil
}

func renderPDF(url string) ([]byte, error) {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.WindowSize(1920, 1080),
	)

	allocCtx, cancelAlloc := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancelAlloc()

	ctx, cancelCtx := chromedp.NewContext(allocCtx)
	defer cancelCtx()

	ctx, cancelTimeout := context.WithTimeout(ctx, 120*time.Second)
	defer cancelTimeout()

	var pdfBuf []byte

	err := chromedp.Run(ctx,
		chromedp.Navigate(url),
		chromedp.WaitVisible(`.slide-thumb-inner`, chromedp.ByQuery),
		chromedp.Sleep(2*time.Second),
		chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			pdfBuf, _, err = page.PrintToPDF().
				WithPaperWidth(20).     // 1920px / 96dpi = 20in
				WithPaperHeight(11.25). // 1080px / 96dpi = 11.25in
				WithMarginTop(0).
				WithMarginBottom(0).
				WithMarginLeft(0).
				WithMarginRight(0).
				WithPrintBackground(true).
				WithPreferCSSPageSize(false).
				Do(ctx)
			return err
		}),
	)
	if err != nil {
		return nil, err
	}

	return pdfBuf, nil
}

func freePort() (int, error) {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return 0, err
	}
	port := l.Addr().(*net.TCPAddr).Port
	l.Close()
	return port, nil
}

func waitForServer(baseURL string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	client := &http.Client{Timeout: 500 * time.Millisecond}
	for time.Now().Before(deadline) {
		resp, err := client.Get(baseURL)
		if err == nil {
			resp.Body.Close()
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}
	return fmt.Errorf("timeout após %s esperando o servidor", timeout)
}
