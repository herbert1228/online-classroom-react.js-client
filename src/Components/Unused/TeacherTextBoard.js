import React from 'react';

export default class extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            context : "",
        }
    }

    handleChange(e){
        this.setState({
            context: e.target.value
        });
        e.preventDefault();
    }

    handleSubmit(e){
        let currentContext = this.state.context;
        this.setState({
            context: ""
        });
        this.props.addTextHistory(currentContext);
        e.preventDefault();
    }

    render(){
        return(
            <div>
                <form onSubmit={(e) => this.handleSubmit(e)}>
                    <input
                        type='text'
                        onChange={(e) => this.handleChange(e)}
                        value = {this.state.context}
                    />
                </form>
            </div>
        )
    }
}