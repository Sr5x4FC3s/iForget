import React from 'react';
import {Platform, StyleSheet, Text, View, PanResponder, Animated, FlatList, AsyncStorage} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Card from './locCard';
import axios from 'axios';

export default class PrevLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      user_data: null,
    };
    this.retrieveAccountName = this.retrieveAccountName.bind(this);
  }

  componentWillMount() {
    //pull data from async storage and set state with all that data
    this.retrieveAccountName();
  }

  retrieveAccountName() {
    let retrievedAccountName = new Promise(resolve => {
      let queryIOS_db = AsyncStorage.getItem('user_accountName', (err, result) => {
        if (err) {
          console.log('thrown error from ASYNC item : ', err);
        }
        return result;
      })
      resolve(queryIOS_db);
    }).then(result => {
      console.log(result);
      this.setState({
        user: result
      }, () => {
        axios.get(`http://localhost:4000/retrieveCoordinates/${this.state.user}`)
        .then(res => {
          console.log(res);
          this.setState({
            user_data: res.data
          }, () => {
          //remove this cb
          console.log('user data', this.state.user_data);
          })
        })
        .catch(err => {
          console.log(err)
        });
      })
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.user_data}
          renderItem={({item, separators}) => <View><Card style={styles.item} item={item.date} place={item.places} index={this.state.user_data.indexOf(item)}/></View>}
        />
      </View>
    )
  } 
};

const styles = StyleSheet.create({
  container: {
     flex: 1,
     paddingTop: 22
    },
    item: {
      marginBottom: 10,
      padding: 10,
      fontSize: 18,
      height: 20,
    },
});