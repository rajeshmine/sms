import React, { Component } from 'react';
// import './style.scss'


export default class CustomCard extends Component {
  render() {
    return (
      <div className="bg-white box-style" children={this.props.children}>

      </div>
    )
  }
} 