import React from "react";
import { Circle, Map, Popup, TileLayer, ZoomControl } from "react-leaflet";
import BarService from "../../services/BarService";
import "./MapComponent.css";

class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.barService = new BarService();
    this.state = {
      activeBar: null,
      center: {
        latitude: 48.8534,
        longitude: 2.3488,
      },
      width: 1600,
      height: 1200,
      zoom: 13,
    };
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions.bind(this));

    this.getBars(
      this.state.center.latitude,
      this.state.center.longitude,
      this.state.zoom
    );
  }

  componentWillUnmount() {
    window.removeEventListener(
      "resize",
      this.updateWindowDimensions.bind(this)
    );
  }

  render() {
    const activeBar = this.state.activeBar;

    const bars = this.state.bars;
    if (!bars) return null;

    return (
      <Map
        center={[this.state.center.latitude, this.state.center.longitude]}
        zoom={this.state.zoom}
        onZoomEnd={this.onZoomEnd}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          url="http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {bars.map((bar) => (
          <Circle
            key={bar.uuid}
            color={this.getColor(bar)}
            radius={50}
            center={[bar.latitude, bar.longitude]}
            onClick={() => {
              this.setState({ activeBar: bar });
            }}
          />
        ))}

        {activeBar && (
          <Popup
            position={[activeBar.latitude, activeBar.longitude]}
            onClose={() => {
              this.setState({ activeBar: null });
            }}
          >
            <div>
              <h2>{activeBar.name}</h2>
              <p>Happy Hours</p>
              <ul>
                {activeBar.happyHours.map((happyHour) => (
                  <li key={happyHour.uuid}>
                    {happyHour.beginDate} - {happyHour.endDate}
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        )}
      </Map>
    );
  }

  onZoomEnd = (map) => {
    if (map.target._zoom > 12) {
      this.getBars(
        map.target._animateToCenter.lat,
        map.target._animateToCenter.lng,
        map.target._zoom
      );
    }
  };

  getBars(latitude, longitude, zoom) {
    const metersPerPx =
      (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
    this.barService
      .retrieveBars(
        latitude,
        longitude,
        (Math.min(this.state.height, this.state.width) * metersPerPx) / 2
      )
      .then((bars) => {
        this.setState({ bars: bars });
      });
  }

  getColor(bar) {
    const current_date = new Date();
    var currentHours = current_date.getHours();
    currentHours = ("0" + currentHours).slice(-2);

    var result = "grey";
    var color = this.getColorByPrice(bar.price);

    bar.happyHours.some(function (el, i) {
      const begin = el.beginDate.split(":")[0];
      const end = el.endDate.split(":")[0];
      const overDay = end - begin < 0;
      const before = begin < currentHours;
      const after = currentHours < end;

      const isHappyHour = overDay ? before || after : before && after;

      return isHappyHour ? ((result = color), true) : false;
    });

    return result;
  }

  getColorByPrice(price) {
    return price <= 3 ? "yellow" : price <= 5 ? "orange" : "red";
  }
}

export default MapComponent;
