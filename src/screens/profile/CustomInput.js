import { View, Text, StyleSheet, TextInput } from 'react-native';
import React from 'react';
import { Colors } from '../../constants';

const CustomInput = ({label="", placeholder=""}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputFieldContainer}>
        <TextInput style={styles.textInput} placeholder={placeholder} editable={false}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10
    },
    inputLabel: {
        fontFamily: "OpenSans-BoldItalic",
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 30,
        marginVertical: 5
    },
    inputFieldContainer: {
        width: '88%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 12,
        flexDirection: 'row',
        borderColor: '#ddd',
        borderWidth: 1,
        marginLeft: 25
    },
    textInput: {
        flex: 1,
        fontFamily: "OpenSans-BoldItalic",
        width:'100%',
        color: Colors.gray,
        fontSize:15
    }
})
export default CustomInput;