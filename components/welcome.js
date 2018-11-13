import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import { Actions } from 'react-native-router-flux';

const Welcome = (props) => {
  return (
    <View style={styles.container}> 
      <Text onPress={() => Actions.login()}>Welcome to iForget. You'll never forget where you parked again.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});

export default Welcome;