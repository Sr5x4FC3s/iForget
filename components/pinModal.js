import React from 'react';
import {Platform, StyleSheet, Text, View, Modal, Button, TouchableHighlight, PanResponder, Animated} from 'react-native';

class PinModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),
    }
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        console.log('hello', e, gestureState);
        // Set the initial value to the current state
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({x: 0, y: 0});
        Animated.spring(
          this.state.scale,
          { toValue: 1.1, friction: 3 }
        ).start();
      },

      // When we drag/pan the object, set the delate to the states pan position
      // onPanResponderMove: Animated.event([
      //   null, {dx: this.state.pan.x, dy: this.state.pan.y},
      // ]),
      onPanResponderMove: (evt, gestureState) => {      
        console.log('swaggy', gestureState)
        return Animated.event([null, {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
        }])(evt, gestureState)
      },

      onPanResponderRelease: (e, gestureState) => {
        // Flatten the offset to avoid erratic behavior
        this.state.pan.flattenOffset();
        Animated.spring(
          this.state.scale,
          { toValue: 1, friction: 3 }
        ).start();

        if (gestureState.dy < 0) {
          Animated.timing(this.state.pan, {
            toValue: {x: 0, y: 0},
            duration: 150,
          }).start(() => {
            this.props.close();
          });
        }
      }
    });
  }

  render() {
    // Destructure the value of pan from the state
    let { pan, scale } = this.state;

    // Calculate the x and y transform from the pan value
    let [translateX, translateY] = [pan.x, pan.y];

    let rotate = '0deg';

    // Calculate the transform property and set it as a value for our style which we add below to the Animated.View component
    let imageStyle = {transform: [{translateX}, {translateY}, {rotate}, {scale}]};

    return (
      <View>
        <Animated.View style={imageStyle} {...this._panResponder.panHandlers} >
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.props.state.show_marker_modal}>
          <View style={styles.text}>
            <Text style={styles.bold}>Address: </Text><Text>{this.props.state.clicked_marker_data.place_name}</Text>
            <View>
              <TouchableHighlight style={styles.highlight}>
                <Button title="Swipe Up to Close" onPress={this.props.close} style={styles.button}></Button>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        </Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'black',
    padding: 12,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'transparent',
  },
  text: {
    height: 150,
    backgroundColor: 'white',
    padding: 22,
    // position: 'absolute', 
    top: 25, left: 0, 
    right: 0, bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 4,
  }, 
  bold: {
    fontWeight: "bold"
  },
  highlight: {
    height: 40,
    width:160,
    borderRadius:10,
    marginLeft :50,
    marginRight:50,
    marginTop :20
  }
})

export default PinModal;