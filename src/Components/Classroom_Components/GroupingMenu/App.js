import React, { Component } from 'react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import Card from './Card'
import CardWall from './CardWall'
import CardLayer from './CardLayer'

import './App.scss'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cards: [
        { id: '1', name: 'issue 1111', status: 'todo' },
        { id: '2', name: 'issue 104', status: 'todo' },
        { id: '3', name: 'issue 9527', status: 'todo' },
        { id: '4', name: 'issue 5278', status: 'todo' },
        { id: '5', name: 'issue 591', status: 'develop' },
        { id: '6', name: 'issue 666', status: 'develop' },
        { id: '7', name: 'issue 9453', status: 'develop' },
        { id: '8', name: 'issue 8591', status: 'deploy' },
        { id: '9', name: 'issue 9999', status: 'deploy' },
      ]
    }
    this.updateCardStatus = this.updateCardStatus.bind(this)
  }

  updateCardStatus(cardId, targetStatus) {
    const { cards } = this.state
    const targetIndex = cards.findIndex(c => (cardId === c.id))
    cards[targetIndex].status = targetStatus // 更新 card status

    const targetCard = cards.splice(targetIndex, 1)[0] // 刪除原始陣列位置的 card
    cards.push(targetCard) // 將目標 card 放入陣列最後一筆

    this.setState({ cards })
  }

  groupOfCards() {
    const { cards } = this.state
    const cardsGroup = {}

    cards.forEach((card) => {
      if (Array.isArray(cardsGroup[card.status])) {
        cardsGroup[card.status].push(card)
      } else {
        cardsGroup[card.status] = [card]
      }
    })
    return cardsGroup
  }

  render() {
    const cards = this.groupOfCards()

    return (
      <div className="App">
        <div className="board">
          <CardLayer />
          {
            ['todo', 'develop', 'test', 'deploy'].map(status => (
              <CardWall
                key={status}
                status={status}
                updateCardStatus={this.updateCardStatus}
              >
                {
                  (cards[status] || []).map(card => (
                    <Card
                      key={card.id}
                      id={card.id}
                      name={card.name}
                      status={card.status}
                    />
                  ))
                }
              </CardWall>
            ))
          }
        </div>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App)
