package main

import (
	"github.com/gorilla/websocket"
	"log"
	"time"
)

type FindHandler func(string) (Handler, bool)

type Message struct {
	Name string `json:"name"`
	Data interface{} `json:"data"`
}

type Client struct {
	send chan Message
	socket *websocket.Conn
	findHandler FindHandler
	userName string
	controller *Controller
}

func (client *Client) Read() {
	timeStart := time.Now()
	var messageNo int
	var message Message
	msgMax := 0
	for {
		if err := client.socket.ReadJSON(&message); err != nil {
			break
		}
		if time.Since(timeStart).Seconds() > 10 {
			timeStart = time.Now()
			if messageNo > msgMax {
				msgMax = messageNo
			}
			//log.Println(client, "'s max msg:", msgMax)
			messageNo = 0
		}
		if messageNo > 50 {
			log.Println("attack from", client)
			//client.send <- Message{"hostile attack", ""}
			time.Sleep(2 * time.Second)
			break
		}
		if handler, found := client.findHandler(message.Name); found {
			handler(client, message.Data)
			//log.Println(message)
			if message.Name != "draw" {
				messageNo++
			}
		}
	}
	client.socket.Close()
}

func (client *Client) Write() {
	for msg := range client.send {
		if err := client.socket.WriteJSON(msg); err != nil {
			break
		}
	}
	client.socket.Close()
}

func NewClient(socket *websocket.Conn, findHandler FindHandler, controller *Controller) *Client {
	return &Client{
		send: make(chan Message),
		socket: socket,
		findHandler: findHandler,
		userName: "",
		controller: controller,
	}
}

//func (client *Client) AddClientToList() {
//	client.controller.joinChan <- client
//}

func (client *Client) Close() {
	client.controller.quitChan <- client

	// remove below
	client.RemoveClientFromList()
	close(client.send)
}

func (client *Client) RemoveClientFromList() {

}