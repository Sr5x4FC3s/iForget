import React from 'react';
import {Platform, StyleSheet, Text, View, AlertIOS, TouchableOpacity, AsyncStorage} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Actions } from 'react-native-router-flux';
import axios from 'react-native-axios';
import SearchBox from './searchbox';
import PinModal from './pinModal';

export default class Maps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeout_status: 600000, // 10mins in milliseconds 
      key: '',
      user_data: null,
      search_value: null,
      searched_data: null, 
      initialRegion: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      },
      region: null,
      target_point: null,
      show_marker_modal: false,
      clicked_marker_data: null,
      marker_related_data: null,
    };
    //clear text input field 
    this.clearInput = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onPressMap = this.onPressMap.bind(this);
    this.onMarkerPress = this.onMarkerPress.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.removeMarker = this.removeMarker.bind(this);
    /****************************************** timer ******************************************* */
    this.resetTime = this.resetTime.bind(this);
    this.timeCheck = this.timeCheck.bind(this);
    this.decrementTime = this.decrementTime.bind(this);
    /****************************************** remove me ******************************************* */
    this.test = this.test.bind(this);
  }

  /******************* define all auto session timeouts ******************/
  resetTime() {
    //resets the timer for user inactivity
    this.setState({
      timeout_status: 600000
    });
  }

  timeCheck() {
    if (this.state.timeout_status === 0) {
      let dataObject = {
        account: this.state.user_data.account,
        coordinates: this.state.target_point,
        login_status: false,
      };

      axios.post(`http://localhost:4000/coordinates`, dataObject)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });


      // set logged_in to false
      this.setState({
        logged_in: !this.state.logged_in
      }, () => {
        AlertIOS.alert(
          'Attention',
          'Due to inactivity, you\'ve been logged out for security reasons'
        )
      });

      //invoke unmount to clear the interval and send the user back to the login because of inactivity 
      this.componentWillUnmount();
    }

    //throw warning if time inactive has reached 8 minutes 
    if (this.state.timeout_status === 120000) {
      AlertIOS.alert(
        'Attention!',
        'You will be logged out due to inactivity in the next two minutes',
        [
          {
            text: 'Got it!',
            onPress: () => { 
              this.resetTime()
            },
          }
        ]
      );
    };
  }

  decrementTime() {
    let decrement_time = this.state.timeout_status - 1000;
    this.setState({
      timeout_status: decrement_time
    });
  }
  /***********************************************************************/

  componentWillMount() {
    //set user state to the prev login or create account user data 
    axios.get(`http://localhost:4000/api_key`)
    .then(res => {
      this.setState({
        key: res.data,
        user_data: this.props.state,
      });
    })
    .catch(err => {
      console.log(err);
    }) 
  }

  componentDidMount() {
    let decreaseTime = setInterval(this.decrementTime, 1000);
    let check = setInterval(this.timeCheck, 1000);
    this.setState({
      minus: decreaseTime,
      verify: check,
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.minus);
    clearInterval(this.state.verify);
    // will remove the key from the devices local storage 
    AsyncStorage.clear(); 
    console.log('logged out, unmounted, and local data erased');
    Actions.logout();
  }

  onChange(e) {
    this.resetTime();
    this.setState({
      search_value: e.nativeEvent.text
    })
  }

  onSubmit() {
    this.resetTime();

    let query_item = this.state.search_value;

    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query_item}.json?access_token=${this.state.key}`)
    .then(res => {
      return res;
    }).then(result => {
      this.setState({
        searched_data: result.data.features,
        region: {
          latitude: result.data.features[0].center[1],
          longitude: result.data.features[0].center[0],
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121
        }
      })
      //clear input field
      this.clearInput.current.clear();
    })
    .catch(err => {
      console.log(err);
    })
  }

  onPressMap(e) {
    this.resetTime();

    if (this.state.target_point === null) {
      this.setState({
        target_point: [e.nativeEvent.coordinate] 
      }, () => {
        let dataObject = {
          account: this.state.user_data.account,
          coordinates: this.state.target_point,
          login_status: this.state.user_data.logged_in,
        }

        axios.post(`http://localhost:4000/coordinates`, dataObject)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        })
      })
    } else {
      let existing_coordinates = this.state.target_point;
      
      existing_coordinates.push(e.nativeEvent.coordinate);
      
      this.setState({
        target_point: existing_coordinates
      }, () => {
        let dataObject = {
          account: this.state.user_data.account,
          coordinates: this.state.target_point,
          login_status: this.state.user_data.logged_in,
        }

        axios.post(`http://localhost:4000/coordinates`, dataObject)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        })


      })
    }
  }

  onMarkerPress(e) {
    this.resetTime();

    let longitude = e.nativeEvent.coordinate.longitude;
    let latitude = e.nativeEvent.coordinate.latitude;

    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${this.state.key}`)
    .then(res => {
      return res;
    })
    .then(result => {
      this.setState({
        show_marker_modal: !this.state.show_marker_modal,
        clicked_marker_data: result.data.features[0],
        marker_related_data: result.data.features
      })
    })
    .catch(err => {
      console.log(err);
    })
  }

  closeModal() {
    this.resetTime();
    this.setState({
      show_marker_modal: !this.state.show_marker_modal
    });
  }

  /*********************** component in question and needs to be implemented ***********************/
  removeMarker() {
    this.resetTime();
    AlertIOS.alert('hello');
    //grey drop back drop
    //can only target markers that are rendered on screen
    //alertIOS.alert (Y/N for removal)
    //remove target marker from the list of markers 
  }
  /**************************************************************************************************/

  /****************************************** remove me ******************************************* */
  test() {
    this.resetTime();
    let data = {
      account: 'admin',
      coordinates: null, 
      login_status: false
    };
    axios.post('http://localhost:4000/coordinates', data)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    })
  }
  /****************************************** ********** ******************************************* */


  render() {
    let markers = [this.state.target_point]

    return (
      <View style={styles.container}>
        <MapView 
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={this.state.region === null ? this.state.initialRegion : this.state.region}
          onPress={this.onPressMap}
          annotations={markers}>
          {this.state.target_point !== null ? this.state.target_point.map(coordinate => {
            return (
              <MapView.Marker pinColor="green" coordinate={coordinate} onPress={this.onMarkerPress}/>
          )}) : null}
        </MapView> 
        <SearchBox onChange={this.onChange} onSubmit={this.onSubmit} reference={this.clearInput}/>
        {this.state.show_marker_modal ? <PinModal state ={this.state} close={this.closeModal}/> : null}
        <TouchableOpacity onPress={this.test}><Text>Touch me</Text></TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    flex: 1
  }
});