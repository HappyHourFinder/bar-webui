import Configuration from "./configuration";

class BarService {
  constructor() {
    this.config = new Configuration();
  }

  async retrieveBars(latitude, longitude, distance) {
    console.log(
      "BarService.getBars(" +
        latitude +
        ", " +
        longitude +
        ", " +
        distance +
        "):"
    );
    return fetch(this.config.API_GATEWAY_URL + "/bars")
      .then((response) => {
        if (!response.ok) {
          this.handleResponseError(response);
        }
        return response.json();
      })
      .then((json) => {
        console.log("Retrieved bars:");
        console.log(json);
        const bars = [];
        const barArray = json._embedded.bars;
        for (var i = 0; i < barArray.length; i++) {
          barArray[i]["link"] = barArray[i]._links.self.href;
          bars.push(barArray[i]);
        }
        return bars;
      })
      .catch((error) => {
        this.handleError(error);
      });
  }

  handleError(error) {
    console.log(error.message);
  }
}

export default BarService;
