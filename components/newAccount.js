import React from 'react';
import { Platform, StyleSheet, View, Text, Button, TextInput, TouchableOpacity, AlertIOS, AsyncStorage } from 'react-native';
import { Actions } from 'react-native-router-flux';
import axios from 'axios';

export default class NewAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: '',
      last_name: '',
      account: '',
      password: '',
      email: '',
      validated: false,
      logged_in: false,
      user_data: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.reset = this.reset.bind(this);
    this.storeAccountName = this.storeAccountName.bind(this);
  }

  storeAccountName(entryKey, accountName) {
    const storeItem = async (key, item) => {
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

  onSubmit() {
    const validation = (first, last, account, password, email) => {
      let finalCheck = [];

      //null check && field checks values
      //password check
      let special_case = password.match(/([!@#$%^&*()`~/><:;'"+=_\\-\\?[\]])/gi);
      let upper_case = password.match(/([A-Z])/gi);
      let int_case = password.match(/([0-9])/gi);

      //check alphanumeric casing 
      let casing_verification = 0;

      for (let z = 0; z < upper_case.length; z++) {
        if (upper_case[z] === upper_case[z].toUpperCase()) {
          casing_verification = 1;
          break;
        } else {
          continue;
        }
      };

      //check email
      let at_Symbol = email.match(/([@])/gi);
      let invalid_char = email.match(/([!#$%%^&*()+=?<>,'":;|\\/[\]{}~`])/gi);
      //verify email address somehow before completing verification

      first.length > 0 ? finalCheck.push(true) : finalCheck.push(false);
      last.length > 0  ? finalCheck.push(true) : finalCheck.push(false);
      account.length > 0  ? finalCheck.push(true) : finalCheck.push(false);
      (password.length >= 8 && special_case !== null && casing_verification !== 0 && int_case !== null)  ? finalCheck.push(true) : finalCheck.push(false);
      (email.length > 0 && at_Symbol !== null && invalid_char === null) ? finalCheck.push(true) : finalCheck.push(false);

      console.log(finalCheck);

      for (let i = 0; i < finalCheck.length; i++) {
        if (finalCheck[i]) {
          continue;
        } else {
          return false;
        }
      }
      return true;
    };

    let first_name = this.state.first_name;
    let last_name = this.state.last_name;
    let account = this.state.account;
    let password = this.state.password;
    let email = this.state.email;
    let checkedObject = validation(first_name, last_name, account, password, email);

    let user_token = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      account: this.state.account,
      password: this.state.password,
      email: this.state.email,
    };

    if (checkedObject) {
      axios.post(`http://localhost:4000/new_user_token`, user_token)
      .then(res => {
        if (res.data.status === 'FAIL') {
          let errors = res.data.error;

          if ((errors[0] === 'ACCOUNT' && errors[1] === 'EMAIL') || (errors[1] === 'EMAIL' && errors[0] === 'ACCOUNT')) {
            AlertIOS.alert('Account and Email already in use');
            this.refs.account.clear();
            this.refs.email.clear();
          } else if (errors[0] === 'ACCOUNT' || errors[1] === 'ACCOUNT') {
            AlertIOS.alert('Account already in use');
            this.refs.account.clear();
          } else if (errors[0] === 'EMAIL' || errors[1] === 'EMAIL') {
            AlertIOS.alert('Email already in use');
            this.refs.email.clear();
          }
        } else {
          this.setState({
            validated: !this.state.validated,
            logged_in: true,
            user_data: this.state
          }, () => {
            let logged_in_token = {
              account: this.state.account,
              logged_in: this.state.logged_in,
              user_data: []
            };

            //store account name locally on sucessful creation of the account => remove at the end of the session
            let iosStoredVal = this.storeAccountName('user_accountName', this.state.account);

            this.refs.first_name.clear();
            this.refs.last_name.clear();
            this.refs.account.clear();
            this.refs.password.clear();
            this.refs.email.clear();
            this.reset();
            Actions.map({state: logged_in_token});
          });
        }
      })
      .catch(err => {
        console.log(err);
      }) 
    };
  }

  reset() {
    this.setState({
      first_name: '',
      last_name: '',
      account: '',
      password: '',
      email: '',
    });
  }
  
  render() {
    return( 
      <View>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          ref="first_name"
          onChangeText={(text) => this.setState({first_name: text})}
          value={this.state.first_name}>
        </TextInput>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          ref="last_name"
          onChangeText={(text) => this.setState({last_name: text})}
          value={this.state.last_name}>
        </TextInput>
        <TextInput
          style={styles.input}
          placeholder="Account Name"
          ref="account"
          onChangeText={(text) => this.setState({account: text})}
          value={this.state.account}>
        </TextInput>
        <TextInput
          style={styles.input}
          placeholder="Password"
          ref="password"
          onChangeText={(text) => this.setState({password: text})}
          value={this.state.password}>
        </TextInput>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          ref="email"
          onChangeText={(text) => this.setState({email: text})}
          value={this.state.email}>
        </TextInput>
        <TouchableOpacity>
          <Button title="Create Account" style={styles.button} onPress={this.onSubmit}></Button>
        </TouchableOpacity>
      </View>
    )
  }
};

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
  button: {
    borderColor:'black',
    borderRadius: 15,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})