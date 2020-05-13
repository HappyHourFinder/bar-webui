import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Slider } from "react-semantic-ui-range";
import { Label, Button, Divider } from "semantic-ui-react";

// we need just one action in this component to update settings made
import { updateSettings } from "../../actions/actions";

class Settings extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    controls: PropTypes.object.isRequired,
  };

  // dispatches the action
  updateSettings() {
    const { controls, dispatch } = this.props;

    dispatch(
      updateSettings({
        settings: controls.settings,
      })
    );
  }

  // we are making settings directly in the controls.settings object which is being passed on to the updateSettings() function up top
  handleSettings(settingName, setting) {
    const { controls } = this.props;

    controls.settings[settingName] = setting;

    this.updateSettings();
  }

  render() {
    const { controls } = this.props;

    // our settings which are needed for the range slider, read more here https://github.com/iozbeyli/react-semantic-ui-range
    const priceSettings = {
      settings: {
        ...controls.settings.price,
        min: 1,
        step: 1,
        start: controls.settings.price.value,
        // when the slider is moved, we want to update our settings and make sure the maximums align
        onChange: (value) => {
          controls.settings.price.value = value;

          this.updateSettings();
        },
      },
    };
    // we have different kinds of settings in here. The components should be quite self-explanatory. Whenever a button is clicked we call handleSettings() and this way pass on our setting through to our state.
    return (
      <div className="mt3">
        <Divider />
        <Label size="small">{"Type de parcours"}</Label>
        <div className="mt3">
          <Button.Group basic size="small">
            {Object.keys({ random: {}, eco: {} }).map((key, i) => (
              <Button
                active={key === controls.settings.mode}
                key={i}
                mode={key}
                onClick={() => this.handleSettings("mode", key)}
              >
                {key}
              </Button>
            ))}
          </Button.Group>
        </div>

        {controls.settings.mode === "eco" && (
          <div>
            <Divider />
            <Label size="small">{"Prix maximum"}</Label>
            <div className="mt3">
              <Slider
                discrete
                color="grey"
                value={controls.settings.price.value}
                inverted={false}
                settings={priceSettings.settings}
              />
              <div className="mt2">
                <Label className="mt2" color="grey" size={"mini"}>
                  {controls.settings.price.value + "€"}
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const controls = state.isochronesControls;
  return {
    controls,
  };
};

export default connect(mapStateToProps)(Settings);
