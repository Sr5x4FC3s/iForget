import React from 'react';
import {Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Button} from 'react-native';

const SearchBox = (props) => {
  return (
    <View style={styles.inputView}>
      <View>
      <TextInput style={styles.input}
        placeholder="Search..."
        ref={props.reference}
        onChange={props.onChange}>
      </TextInput>
      </View>
      <View>
        <TouchableOpacity style={styles.buttonStyles}>
          <Button title="Submit" onPress={props.onSubmit} style={styles.button}></Button>
        </TouchableOpacity>
      </View>
      {/* <TouchableOpacity onPress={props.onSubmit}>
        <View style={styles.button}>
          <Text>Submit</Text>
        </View>
      </TouchableOpacity>  */}
    </View>     
  )
};

const styles = StyleSheet.create({
  inputView: {
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute', 
    top: 0,
    left: 5,
    right: 5,
  },
  button: {
    position: 'absolute',
    top: 0, 
  },
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
  buttonStyles: {
    height: 40,
    width: 70,
    borderRadius:10,
    backgroundColor : "white",
  }
})

export default SearchBox;