import React from "react";
import { Text, View , StyleSheet, Image, Alert} from "react-native";
import { TouchableOpacity, KeyboardAvoidingView, ToastAndroid, TextInput} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Permissions from "expo-permissions";
import * as firebase from 'firebase'
import db from '../config'

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: "",
      buttonState:"normal",
      scannedBookID:"",
      scannedStudentID:""
    };
  }

handleBarcodeScan = async ({type,data}) => {
  const {buttonState}=this.state
  if (buttonState==="Book ID"){
    this.setState ({
    scanned:true,
    scannedBookID: data,
    buttonState:'normal'
  })
    }
else if (buttonState==="Student ID"){
  this.setState ({
    scanned:true,
    scannedStudentID: data,
    buttonState:'normal'
})
}
}
  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions: status === "granted",
      buttonState:id,
      scanned:false
    });
  };
  
  checkIssuableEligibility=async()=>{
    const studentRef=await db.collections("Students").where("studentid","==",this.state.scannedStudentID).get()
    var isStudentEligible=""
    if(studentRef.docs.length==0){
      isStudentEligible=false
      Alert.alert("STUDENT ID DOES NOT EXIST IN THE DATABASE")
      this.setState({
        scannedBookID:"",
        scannedStudentID:""
      })
    }
    else{
      studentRef.docs.map((doc)=>{
        var student=doc.data()
        if(student.number_of_books_issued<2){
          isStudentEligible=true
        }
        else{
          isStudentEligible=false
          Alert.alert("STUDENT ALREADY HAS 2 BOOKS")
          this.setState({
            scannedBookID:"",
            scannedStudentID:""           
          })
        }
      }
      )
    }
    return isStudentEligible
  }

  checkReturnEligibility=async()=>{
    const transactionRef=await db.collections("Transaction").where("BookID","==",this.state.scannedBookID).limit(1).get()
    var isStudentEligible=""
    transactionRef.docs.map((doc)=>{
      var lastBookTransaction=doc.data()
      if (lastBookTransaction.StudentID===this.state.StudentID){
        isStudentEligible=true
      }
      else{
        isStudentEligible=false
        Alert.alert("THE BOOK WAS NOT ISSUED BY THIS STUDENT")
        this.setState({
          scannedBookID:"",
          scannedStudentID:""           
        })
      }
    })
  }
  handleTransaction=async() =>{

    var transactionType=await this.checkBookEligibility()
    console.log("TransactionType", transactionType)
    if(!transactionType){
      Alert.alert("BOOK DOES NOT EXIST IN THE DATABASE")
      this.setState({
        scannedBookID:"",
        scannedStudentID:""
      })
    }
    else if (transactionType==="issued"){
      var isStudentEligible=await this.checkIssuableEligibility()
      if(isStudentEligible){
        this.initiateBookIssue()
          Alert.alert("BOOK ISSUED TO THE STUDENT")
        
      }
    }
    else{
       var isStudentEligible=await this.checkReturnEligibility()
       if (isStudentEligible){
         this.initiateBookReturn()
           Alert.alert("BOOK RETURNED")
         
       }
    }

  }
  
  checkBookEligibility=async() => {
    const bookRef=await db.collections("BOOKS").where("bookid","==",this.state.scannedBookID).get()
    var transactionType=""
    if(bookRef.docs.length==0){
      transactionType=false
      console.log(bookRef.docs.length)
    }
    else{
      bookRef.docs.map(
        (doc) => {
          var book=doc.data()
          if(book.bookavailibility){
            transactionType="issue"
          }
          else{
            transactionType="return"
          }
        }
      )
    }
    return transactionType
  }

    initiateBookIssue=async() => {
      db.collection("Transaction").add({
        "StudentID":this.state.scannedStudentID,
        "BookID":this.state.scannedBookID,
        "date":firebase.firestore.Timestamp.now().todate(),
        "getTransaction":"issue"
      })

      db.collection("BOOKS").doc(this.state.scannedBookID).update({
        "bookavailibility":false
      })
      db.collection("Students").doc(this.state.scannedStudentID).update({
        "no_of_books_issued":firebase.firestore.FieldValue.increment(1)
      })
      Alert.alert("BOOK ISSUED")
      this.setState(
        {
          scannedBookID:"",
          scannedStudentID:""
        }
      )
    }


    initiateBookReturn=async() => {
      db.collection("Transactions").add({
        "StudentID":this.state.scannedStudentID,
        "BookID":this.state.scannedBookID,
        "date":firebase.firestore.Timestamp.now().todate(),
        "getTransaction":"return"
      })

      db.collection("BOOKS").doc(this.state.scannedBookID).update({
        "bookavailibility":true
      })
      db.collection("Students").doc(this.state.scannedStudentID).update({
        "no_of_books_issued":firebase.firestore.FieldValue.increment(-1)
      })
      Alert.alert("BOOK RETURNED")
      this.setState(
        {
          scannedBookID:"",
          scannedStudentID:""
        }
      )
    }


    render() {
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const buttonState = this.state.buttonState

    if(buttonState!=="normal" && hasCameraPermissions){

      return(

        <BarCodeScanner
        onBarCodeScanned={scanned? undefined:this.handleBarcodeScan}
        />

      )

    }
    else if(buttonState==="normal"){
      return (
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
          <View>
            <Image 
              source={require("../assets/booklogo.jpg")}
              style={{width:200, height:200 }}
            />
            <Text style={{textAlign:'center', fontSize:30}}>
              WILY APP
            </Text>
          </View>
          <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book ID"
              onChangeText={(text) => {
                this.setState({scannedBookID:text})
              }} 
              value={this.state.scannedBookID}
            /> 
            <TouchableOpacity style={styles.scanButton} 
            onPress={()=>{this.getCameraPermissions("Book ID")}}
            >
            <Text style={styles.buttonText}>
              scan
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student ID"
              onChangeText={(text) => {
                this.setState({scannedStudentID:text})
              }}
              value={this.state.scannedStudentID}
            /> 
            <TouchableOpacity style={styles.scanButton}
            onPress={()=>{this.getCameraPermissions("Student ID")}}
            >
            <Text style={styles.buttonText}>
              scan
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={async() => {this.handleTransaction()
          this.setState({scannedBookID:"", scannedStudentID:""})
          }}>
            <Text>SUBMIT</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }

  }
}

const styles = StyleSheet.create({
  scanButton: { backgroundColor: "#2196F3", padding: 10, margin: 10 },
  buttonText: { fontSize: 20 },
});
