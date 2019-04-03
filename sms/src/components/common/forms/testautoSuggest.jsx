import React from 'react';

import Autosuggest from 'react-autosuggest';



const colourStyles = {
  container: styles => ({ ...styles, padding: 0 }),
  dropdownIndicator: styles => ({ ...styles, padding: '0 5px', margin: 0 }),
  indicatorSeparator: styles => ({ ...styles, padding: 0, margin: 0, backgroundColor: 'transparent' }),
  control: styles => ({ ...styles, padding: 0, paddingLeft: '4px', borderColor: '#ced4da', margin: 0, minHeight: '30px', fontSize: '10pt' }),
  input: styles => ({ ...styles, padding: 0, margin: 0 ,width:100 }),
  placeholder: styles => ({ ...styles, padding: 0, margin: 0,fontSize:'10px',paddingLeft:'5px'}),
  singleValue: (styles, { data }) => ({ ...styles, padding: 0, margin: 0 }),
  valueContainer: styles => ({ ...styles, padding: 0, margin: 0 }),
};

const renderSuggestion = suggestion => (
  <div>
    {suggestion.name}
  </div>
);

export class TestAutoSuggest extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: [],
      data: []
    };
  }

  componentDidMount = async () => {
  
    const { data } = this.props
    await this.setState({ data })
  }


  onChange = (event, { newValue }) => {
   
    this.setState({
      value: newValue
    });
  };

  getSuggestionValue = suggestion => { 
    const { getOptionValue } = this.props
    getOptionValue( suggestion.code,suggestion.name )
    return suggestion.name
  };

  getSuggestions = value => {
    const { data } = this.state;
 
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
   
    return inputLength === 0 ? [] : data.filter(item => {
  
      return item.name.toLowerCase().slice(0, inputLength) === inputValue
    }
    );
  };

  onSuggestionsFetchRequested = async ({ value }) => {
    await this.setState({
      suggestions: this.getSuggestions(value)
    });
  };



  onSuggestionsClearRequested = async () => {
    await this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: 'Type a Name',
      value,
      onChange: async (event, { newValue }) => {
        await this.setState({ value: newValue });        
      }
    };


    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        // onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={renderSuggestion}
        styles={colourStyles}
        inputProps={inputProps}
      />
    );
  }
}