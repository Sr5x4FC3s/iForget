import React from 'react';
import {Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Button, AlertIOS, AsyncStorage} from 'react-native';
import { Actions } from 'react-native-router-flux';
import axios from 'axios';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: null, 
      password: null, 
      logged_in: false,
      user_data: null,
    };
    this.clearInput = React.createRef();
    this.onSubmit = this.onSubmit.bind(this);
    this.storeAccountName = this.storeAccountName.bind(this);
  }

  storeAccountName(key, item) {
    let entryKey = key;
    let accountName = item;
    let storeItem = async (key, item) => {
      try {
          //we want to wait for the Promise returned by AsyncStorage.setItem()
          //to be resolved to the actual value before returning the value
          var jsonOfItem = await AsyncStorage.setItem(key, item);
          return jsonOfItem;
      } catch (error) {
        console.log(error.message);
      }
    }
    storeItem(entryKey, accountName);
  }

  onSubmit(e) {
    let user_token = {
      account: this.state.account,
      password: this.state.password
    };

    if (this.state.account !== null && this.state.password !== null) {
      axios.post(`http://localhost:4000/user_login`, user_token)
      .then(res => {
        if (res.data.error) {
          if (res.data.error[0] === 'ACCOUNT_NOT_FOUND') {
            AlertIOS.alert('Account or Password is incorrect');
          } else if (res.data.error[0] === 'PASSWORD') {
            AlertIOS.alert('Account or Password is incorrect');
          } 
        } else {
          this.setState({
            logged_in: !this.state.logged_in,
            user_data: res.data
          }, () => {
            let logged_in_token = {
              account: this.state.account,
              logged_in: this.state.logged_in,
              user_data: this.state.user_data.data
            };

            //implement async storage here to store the user data  => data will need to be removed at log out
            let iosStoredVal = this.storeAccountName('user_accountName', this.state.account);

            this.refs.account_name.clear();
            this.refs.password_assc.clear();
            Actions.map({state: logged_in_token});
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
    }
  }

  reset() {
    this.setState({
      account: null,
      password: null
    });
  }

  render() {
    return (
      <View>
        <TextInput
          style={styles.input}
          placeholder="Account Name"
          ref="account_name"
          onChangeText={(text) => this.setState({account: text})}
          value={this.state.account}>
        </TextInput>
        <TextInput
          style={styles.input}
          placeholder="Password"
          ref="password_assc"
          onChangeText={(text) => this.setState({password: text})}
          value={this.state.password}>
        </TextInput>
        <TouchableOpacity>
          <Button title="Login" onPress={this.onSubmit}> </Button>
          <Button title="Create Account" onPress={() => Actions.newAccount()}></Button>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  input: {
    height: 36,
    padding: 10,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#48BBEC',
    backgroundColor: 'white',
  },
})