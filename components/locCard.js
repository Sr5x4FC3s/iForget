import React from 'react';
import {Platform, StyleSheet, Text, View, PanResponder, Animated, TouchableOpacity, TouchableHighlight, Dimensions, Button, AlertIOS} from 'react-native';

export default class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),
      toggle_date: false,
      toggle_delete: false,
    };

    this.onToggle = this.onToggle.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.delete = this.delete.bind(this);
    this.cancel = this.cancel.bind(this);
  };

  componentWillMount() {
    this.translateX = new Animated.Value(0);
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderMove: Animated.event([null, {dx: this.translateX}]),
      onPanResponderRelease: (e, {vx, dx}) => {
        const screenWidth = Dimensions.get("window").width;
        // if (Math.abs(vx) >= 0.5 || Math.abs(dx) >= 0.5 * screenWidth) {
        if (Math.abs(vx) >= 0.5 || dx <= -0.5 * screenWidth) {
          Animated.timing(this.translateX, {
          //if horizontal change is > 0 (to the right) 
            toValue: -0.25 * screenWidth,
            duration: 200
          }).start();
          this.setState({
            toggle_delete: true
          })
        } else {
          Animated.spring(this.translateX, {
            toValue: 0,
            bounciness: 10
          }).start();
          this.setState({
            toggle_delete: false
          })
        }
      }
    });
  }

  onToggle(e) {
    this.setState({
      toggle_date: !this.state.toggle_date
    });
  }

  delete(e) {
    console.log(e);
    
  }

  cancel(e) {
    console.log(e);
  }

  onDelete(e) {
    AlertIOS.alert('Attention!', 'Remove entry?', [{text:'Confirm', onPress: this.delete},{text: 'Cancel', onPress: (this.cancel)}]);
    console.log(e.nativeEvent);
  }

  render() {
    console.log(this.state.toggle_delete, 'state')
    return (
      <View style={styles.listItem}>
        <Animated.View style={{transform: [{translateX: this.translateX}]}} {...this._panResponder.panHandlers}>
          <TouchableOpacity onPress={this.onToggle}>
            <View style={styles.innerCell}>
              <Text>{this.props.item}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onToggle}>
          <View>
            {this.state.toggle_date ? this.props.place.map(address => {
              return (
                <View style={styles.container} ref={this.props.index}>
                  <Text>Coordinates: {address.latitude} + {address.longitude}</Text>
                </View>
              )
            }) : null}
          </View>
          </TouchableOpacity>
        </Animated.View>
          {/* <View style={styles.absoluteCell}>
            {this.state.toggle_delete ? <Button style={styles.absoluteCell} title='Delete' onPress={this.onDelete}></Button> : null}
          </View> */}
        <View style={styles.absoluteCell}>
          <Button title='Delete' onPress={this.onDelete}></Button>
        </View>
        {/* <Button style={styles.absoluteCell} title='Delete' onPress={this.onDelete}></Button> */}
      </View>
    )
  } 
};

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  listItem: {
    marginLeft: 100,
    justifyContent: 'center',
    backgroundColor: 'red',
  },
  absoluteCell: { 
    // zIndex: 1,
    top: 0,
    bottom: 0,
    right: 0, 
    marginLeft: 100, 
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  innerCell: {
    width: screenWidth,
    position: 'absolute',
    // zIndex: 2,
    height: 50,
    marginLeft: -100,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },  
})
