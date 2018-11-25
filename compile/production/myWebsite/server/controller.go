package main

import (
	"log"
)

type Controller struct {
	clients []*Client
	users []*User
	whiteboard []Stroke // Todo pointer
	chats []*Chat
	joinChan chan *Client
	quitChan chan *Client
	msgChan chan Message
}

func NewController(joinChan, quitChan chan *Client, msgChan chan Message) *Controller{
	return &Controller{
		clients: []*Client{},
		users: []*User{},
		whiteboard: []Stroke{},
		joinChan: joinChan,
		quitChan: quitChan,
		msgChan: msgChan,
	}
}

func (c Controller) run() {
	for {
		select {
		case client, _ := <-c.joinChan:
			log.Println("joinChan")
			c.clients = append(c.clients, client)
			c.BoardCastToAll("client join", client)
			log.Println("Connections:", c.clients) //Log
		case client, _ := <-c.quitChan:
			log.Println("quitChan:", client)
			for i, cl := range c.clients {
				if cl == client {
					c.clients = append(c.clients[:i], c.clients[i+1:]...)
				}
			}
			c.BoardCastToAll("client quit", client)

			clientFound := false
			for index, cl := range c.clients {
				if cl.socket == client.socket { // Todo how abt cl == client
					c.clients = append(c.clients[:index], c.clients[index+1:]...)
					clientFound = true
					break
				}
			}
			for index, u := range c.users {
				if u.KeyFromClient.userName == client.userName {
					c.users = append(c.users[:index], c.users[index+1:]...)
					log.Println("Logout:", u.KeyFromClient.userName) //Log
					c.BoardCastToAll("no. login change", c.users)
					return
				}
			}
			if !clientFound {
				log.Panic("Client Not Found, Cannot Remove")
			}
			log.Println("Connections:", c.clients) //Log
		case msg, _ := <-c.msgChan:
			log.Println("msgChan:", msg.Name)
			switch msg.Name {
			case "user join":
				var u *User
				u = msg.Data.(*User)
				c.users = append(c.users, u)
				c.BoardCastToAll( "no. login change", u)

			case "init client":
				msg.Data.(*Client).send <- Message{"init", Info{c.users, c.chats}}

			case "new chat":
				newChat := msg.Data.(*Chat)
				c.chats = append(c.chats, newChat)
				c.BoardCastToAll("new chat", c.chats)

			case "user draw":
				client := <- msg.Data.(chan *Client)
				draw := <- msg.Data.(chan Stroke)
				for i, u := range c.users {
					if u.KeyFromClient.userName == client.userName {
						u.Whiteboard = append(u.Whiteboard, draw)
						c.users = append(append(c.users[:i], u), c.users[i + 1:]...)
						// TODO should broadcast new stroke only
						client.controller.BoardCastToAllExceptSource("draw to client", c.users, client)
						break
					}
				}
			//case "to client":
			//	msg.Data.(*Message).
			default:
				c.BoardCastToAll(msg.Name, msg.Data)
			}
		}
	}
}

func (c Controller) BoardCastToAll(name string, data interface{}) {
	for _, cl := range c.clients {
		cl.send <- Message{name, data}
	}
}

func (c *Controller) BoardCastToAllExceptSource(name string, data interface{}, except *Client) {
	for _, cl := range c.clients {
		if cl != except {
			cl.send <- Message{name, data}
		}
	}
}