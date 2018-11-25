package old_server

import (
	"net/http"
	"github.com/gorilla/websocket"
	"fmt"
)

type Handler func(*Client, interface{})

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Router struct{
	rules map[string]Handler
}

func NewRouter() *Router{
	return &Router{
		rules: make(map[string]Handler),
	}
}

func (r *Router) Handle(msgName string, handler Handler){
	r.rules[msgName] = handler
}

func (r *Router) FindHandler(msgName string) (Handler, bool) {
	handler, found := r.rules[msgName]
	return handler, found
}

func (e *Router) ServeHTTP(w http.ResponseWriter, r *http.Request) { // inside goroutine
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		//fmt.Printf(err.Error())
		//fmt.Println()
		fmt.Fprint(w, err.Error())
		return
	}
	client := NewClient(socket, e.FindHandler)
	client.AddClientToList()
	defer func() {
		client.Close()
	}()
	go client.Write()
	client.Read()
}
