import { StatusBar, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import {Colors} from '../../src/constans'

const Splash = ({navigation}) => {

  setTimeout(() => {
    navigation.replace('Onboarding')

  }, 3000);
  return (
    <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', backgroundColor:Colors.white }}>
      <StatusBar barStyle="light-content" hidden={false} backgroundColor="#ffffff"/>
      <Image source={require('../assets/images/icon_gara.jpg')} style={{width:50, height:50}}/>
      <Text style={{fontFamily:'OpenSans-Bold', fontSize:40, color:Colors.primary}}>Gara UTE</Text>
    </View>
  )
}

export default Splash

const styles = StyleSheet.create({})