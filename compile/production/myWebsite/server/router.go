package main

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
	controller *Controller
}

func NewRouter(controller *Controller) *Router{
	return &Router{
		rules: make(map[string]Handler),
		controller: controller,
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
		w.WriteHeader(http.StatusInternalServerError) //500
		fmt.Fprint(w, err.Error())
		return
	}

	client := NewClient(socket, e.FindHandler, e.controller)
	defer func() {
		client.Close()
	}()
	client.controller.joinChan <- client
	go client.Write()
	client.Read()
}
