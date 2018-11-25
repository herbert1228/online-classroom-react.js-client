package old_server

import (
	"github.com/gorilla/websocket"
	"log"
	"time"
	"sync"
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
}
var clients []*Client
var userLock sync.Mutex
var clientLock sync.Mutex

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
			client.send <- Message{"hostile attack", ""}
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

func NewClient(socket *websocket.Conn, findHandler FindHandler) *Client {
	return &Client{
		send: make(chan Message),
		socket: socket,
		findHandler: findHandler,
		userName: "",
	}
}

func (client *Client) AddClientToLoginList() {
	userLock.Lock()
	users = append(users, User{client.userName, []Stroke{}})
	BoardCastToAll( "no. login change", users)
	userLock.Unlock()
}

func (client *Client) AddClientToList() {
	//log.Println("wait log")
	clientLock.Lock()
	//log.Println("entered log")
	clients = append(clients, client)
	clientLock.Unlock()
	log.Println("Connections:", clients) //Log
}

func (client *Client) Close() {
	client.RemoveClientFromList()
	close(client.send)
}

func (client *Client) RemoveClientFromList() {
	clientFound := false
	for index, c := range clients {
		if c.socket == client.socket {
			clientLock.Lock()
			clients = append(clients[:index], clients[index+1:]...)
			//log.Println("Rm client")
			clientLock.Unlock()
			clientFound = true
			break
		}
	}
	for index, u := range users {
		if u.Name == client.userName {
			userLock.Lock()
			users = append(users[:index], users[index+1:]...)
			log.Println("Logout:", u.Name) //Log
			BoardCastToAll("no. login change", users)
			userLock.Unlock()
			return
		}
	}
	if !clientFound {
		log.Panic("Client Not Found, Cannot Remove")
	}
	log.Println("Connections:", clients) //Log
}

func BoardCastToAll(name string, data interface{}) {
	if len(clients) <= 0 {
		return
	}
	//switch data.(type){
	for _, c := range clients {
		c.send <- Message{name, data}
	}
}

func (c *Client) BoardCastToAllExceptSource(name string, data interface{}) {
	if len(clients) <= 0 {
		return
	}
	for _, clit := range clients {
		if clit != c {
			clit.send <- Message{name, data}
		}
	}
}