import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import Maps from './map';
import Welcome from './welcome';
import PrevLocations from './prevLocations';
import Login from './login';
import NewAccount from './newAccount';
import { Router, Scene, Actions } from 'react-native-router-flux';

const Routes = () => {
  return (
    <Router>
      <Scene key="root">
        <Scene 
          key="welcome"
          component={Welcome}
          title="Welcome"
          onRight={() => Actions.newAccount()}
          rightTitle="Create Account"
          initial
        />
        <Scene
          key="map"
          component={Maps}
          title="Map"
          onLeft={() => Actions.logout()}
          leftTitle="Log-Out"
          onRight={() => Actions.locations()}
          rightTitle="Locations"
        />
        <Scene
          key="locations"
          component={PrevLocations}
          title="Locations"
        />
        <Scene
          key="newAccount"
          component={NewAccount}
          title="New Account"
        />
        <Scene
          key="login"
          component={Login}
          title="Log-In"
        />
        <Scene 
          key="logout"
          component={Login}
          renderLeftButton={() => (null)}
          title="Log-In"
        />
      </Scene>
    </Router>
  )
}

export default Routes;