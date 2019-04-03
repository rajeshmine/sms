import React from 'react';
import { Link } from "react-router-dom";
// import './style.scss'

 class TabsItem extends React.Component {

  
  constructor(props) {
    super(props);

    this.state = {
      Icon: this.props.icon,
      Text: this.props.text,
      Active: this.props.active,
      To: this.props.to
    };

  }

  divactive() {
    if (this.state.Active) return 'tabstyle active';
    return 'tabstyle'
  }

  render() {
    return (
      <div className="wrapper">
        {
          this.state.To !== undefined ? <Link className="link" to={this.state.To}>
            <div className={this.divactive()} >
              {this.state.Icon} <span> {this.state.Text}</span >
            </div >
          </Link> :
            <div className={this.divactive()} >
              {this.state.Icon} <span> {this.state.Text}</span >
            </div >
        }
      </div>
    )
  }
} 

export default TabsItem