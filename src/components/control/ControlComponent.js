import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// we are importing some of the beautiful semantic UI react components
import { Segment, Search, Divider } from "semantic-ui-react";

// here are our first two actions, we will be adding them in the next step, bare with me!
import {
  updateTextInput,
  fetchHereGeocode,
  updateCenter,
} from "../../actions/actions";

import SettingsComponent from "./SettingsComponent";

// to wait for the users input we will add debounce, this is especially useful for "postponing" the geocode requests
import { debounce } from "throttle-debounce";

// some inline styles (we should move these to our index.css at one stage)
const segmentStyle = {
  zIndex: 999,
  position: "absolute",
  width: "400px",
  top: "20px",
  bottom: "20px",
  left: "20px",
  overflow: "auto",
  padding: "20px",
};

class ControlComponent extends React.Component {
  static propTypes = {
    userTextInput: PropTypes.string.isRequired,
    results: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    isochronesCenter: PropTypes.object,
  };

  constructor(props) {
    super(props);
    // binding this to the handleSearchChange method
    this.handleSearchChange = this.handleSearchChange.bind(this);
    // we are wrapping fetchGeocodeResults in a 1 second debounce
    this.fetchGeocodeResults = debounce(1000, this.fetchGeocodeResults);
  }

  // if the input has changed... fetch some results!
  handleSearchChange = (event) => {
    const { dispatch } = this.props;

    dispatch(
      updateTextInput({
        inputValue: event.target.value,
      })
    );
    this.fetchGeocodeResults();
  };

  // if a user selects one of the geocode results update the input text field and set our center coordinates
  handleResultSelect = (e, { result }) => {
    const { dispatch } = this.props;

    dispatch(
      updateTextInput({
        inputValue: result.title,
      })
    );

    dispatch(
      updateCenter({
        isochronesCenter: result.displayposition,
      })
    );
  };

  // our method to fire a geocode request
  fetchGeocodeResults() {
    const { dispatch, userTextInput } = this.props;
    // If the text input has more then 0 characters..
    if (userTextInput.length > 2) {
      dispatch(
        fetchHereGeocode({
          inputValue: userTextInput,
        })
      );
    }
  }

  render() {
    // The following constants are used in our search input which is also a semanticUI react component <Search... />
    const { isFetching, userTextInput, results } = this.props;

    return (
      <div>
        <Segment style={segmentStyle}>
          <div>
            <h4>Prépare-toi pour ta prochaine tournée des bars !</h4>
          </div>
          <Divider />
          {/* they are tachyons css classes by the way..*/}
          <div className="flex justify-between items-center mt3">
            {/* more about the props can be read here https://react.semantic-ui.com/modules/search the most important part to mention here are our objects being fed to it. When a user types text into the input handleSearchChange is called. When the geocode API is called the variable loading will be set true to show the spinner (coming from state). The results are shown in a dropdown list (also coming from the state) and the value shown in the input is userTextInput (..also from state). */}
            <Search
              onSearchChange={this.handleSearchChange}
              onResultSelect={this.handleResultSelect}
              type="text"
              fluid
              input={{ fluid: true }}
              loading={isFetching}
              className="flex-grow-1 mr2"
              results={results}
              value={userTextInput}
              placeholder="Rechercher un bar ..."
            />
          </div>
          <div className="mt2">
            <SettingsComponent />
          </div>
        </Segment>
      </div>
    );
  }
}

//
const mapStateToProps = (state) => {
  const userTextInput = state.isochronesControls.userInput;
  const results = state.isochronesControls.geocodeResults;
  const isFetching = state.isochronesControls.isFetching;

  // new
  const settings = state.isochronesControls.settings;

  return {
    userTextInput,
    results,
    isFetching,
    settings,
  };
};

export default connect(mapStateToProps)(ControlComponent);
