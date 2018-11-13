import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import Routes from './components/router'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Routes />
    );
  }
}

