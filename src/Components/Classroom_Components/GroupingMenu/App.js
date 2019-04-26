import React, { Component } from 'react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import Card from './Card'
import CardWall from './CardWall'
import CardLayer from './CardLayer'
import {ClassStatusChannel} from '../../../interface/connection'

import './App.scss'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      groups: ['All', 'Group1', 'Group2', 'Group3']
    }
    this.updateCardStatus = this.updateCardStatus.bind(this)
  }

  updateCardStatus(cardId, targetStatus) {
    const cards = this.props.groupCards
    const targetIndex = cards.findIndex(c => (cardId === c.id))
    cards[targetIndex].status = targetStatus // update card status

    const targetCard = cards.splice(targetIndex, 1)[0] // delete old card
    cards.push(targetCard) // insert target card to last position of the array
    
    const result = ClassStatusChannel.changeGroup(cardId, targetStatus)
    this.props.handleNotification(`${cardId} is grouped to ${targetStatus}`)
  }

  groupOfCards() {
    const cards = this.props.groupCards
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
            this.state.groups.map(status => (
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
