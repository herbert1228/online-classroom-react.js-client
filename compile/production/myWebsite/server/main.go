package main

import (
	"net/http"
)

func RunServer() {
	joinChan := make(chan *Client)
	quitChan := make(chan *Client)
	msgChan := make(chan Message)

	controller := NewController(joinChan, quitChan, msgChan)
	router := NewRouter(controller)

	go controller.run()

	router.Handle("init", initialize)
	router.Handle("user login", userLogin)
	router.Handle("user chat", userChat)
	router.Handle("draw", userDraw)

	http.Handle("/", router)
	//http.Handle("/", http.FileServer(http.Dir(".")))

	http.ListenAndServe(":4000", nil)

}

func main() {
	RunServer()
}

// Client -> Server
// {"msgName": "init", "data": null}
// {"msgName": "user login", "data": string()}
// {"msgName": "user chat", "data": {"id": string(), "user": string(), "content": string(), "time": string()}}

// Server -> Client
// {"name": "init", "data": {"user": }}