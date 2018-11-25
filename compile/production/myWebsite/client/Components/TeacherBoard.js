import React from 'react';
import TeacherWhiteBoard from './TeacherWhiteBoard'
import TeacherTextBoard from './TeacherTextBoard'

export default class extends React.Component{
    constructor(prop){
        super(prop);
        this.state = {
            textBoard: [{record: "default"}]
        };
    }

    addTextHistory(currentContext){
        let {textBoard} = this.state;
        textBoard.push({record: currentContext});
        this.setState({
            textBoard: textBoard,
        });
    }

    render(){
        return(
            <div className="classroom">
                <div>
                    <TeacherWhiteBoard/>
                </div>
                <div>
                    <TeacherTextBoard addTextHistory={(i) => this.addTextHistory(i)}/>
                </div>
            </div>
        )
    }
}