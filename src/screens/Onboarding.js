import { ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Colors } from '../constants'
import Buttons from '../components/Buttons'


const Onboarding = ({navigation}) => {

  return (
    <View style={{flex:1, backgroundColor:Colors.white}}>
      <StatusBar barStyle='dark-content' backgroundColor='#fff'/>

      {/*Welcome Image*/}
      <View style={{flex:3, flexDirection:'column', backgroundColor:'#ddd'}}>
        <ImageBackground source={require('../assets/images/welcome_image.jpg')}
        style={{flex:1, width:'100%', backgroundColor:'#fff'}}/>
      </View>

      {/*Button and text*/}
      <View style={{flex:2, backgroundColor:'#fff'}}>
        {/*Text*/}
        <View style={{flex:1, flexDirection:'column', justifyContent:'flex-start', alignItems:'center', backgroundColor:'#fff'}}>
          <Text style={{fontFamily:'OpenSans-Bold', color:Colors.black, fontSize:40}}>Gara UTE</Text>
          <Text style={{maxWidth:'80%', fontFamily:'OpenSans-Medium', color:'#999', fontSize:18, textAlign:'center',
          paddingTop:10}}> Welcome to the world of cars. Where you can shop for all types of car accessories.</Text>
        </View>

        {/*Button*/}
        <View style={{flex:1, flexDirection:'column', justifyContent:'flex-end', alignItems:'center'}}>
          <Buttons btn_text={"Get Started"} on_press={()=>navigation.navigate("Login")}/>
        </View>
      </View>
    </View>
  )
}

export default Onboarding

const styles = StyleSheet.create({})