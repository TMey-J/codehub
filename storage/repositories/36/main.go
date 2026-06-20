package main

import (
	"html/template"
	"net/http"
)

func main() {
	ctrl := NewCalculatorController()

	// Serve the frontend page.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl, err := template.ParseFiles("templates/index.html")
		if err != nil {
			http.Error(w, "Template not found", http.StatusInternalServerError)
			return
		}
		tmpl.Execute(w, nil)
	})

	// API endpoint.
	http.HandleFunc("/evaluate", ctrl.HandleEvaluate)

	// Start the server.
	println("Server started at http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
