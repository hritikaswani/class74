import React from 'react';
import { FlatList, ScrollView, Text, TextInputComponent, TouchableOpacity, TouchableWithoutFeedbackBase, View } from 'react-native'
import db from '../config'

export default class Searchscreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
      search:""
    }
  }
  componentDidMount = async () => {
    const query = await db.collection("Transaction").get()
    query.docs.map(
      (doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()]
        })
      }
    )
  }

  fetchMoreTransactions = async () => {
    var enteredText=Text.split("")
    var text=Text.toUpperCase()
    if(enteredText[0].toUpperCase==='B'){
      const transaction = await db.collection("Transaction").where("BookID","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: docs
        })
      })
    }
    else if(enteredText[0].toUpperCase==='S'){
      const transaction = await db.collection("Transaction").where("StudentID","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: docs
        })
      })
    }
  }
  searchTransactions= async (Text) => {
    var enteredText=Text.split("")
    var text=Text.toUpperCase()
    if(enteredText[0].toUpperCase==='B'){
      const transaction = await db.collection("Transaction").where("BookID","==",text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: docs
        })
      })
    }
    else if(enteredText[0].toUpperCase==='S'){
      const transaction = await db.collection("Transaction").where("StudentID","==",text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: docs
        })
      })
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput style={styles.bar} 
            placeholder="ENTER BOOK ID/STUDENT ID"
            onChangeText={(Text)=>{
              this.setState({
                search:Text
              })
            }}
          />
          <TouchableOpacity style={styles.searchButton} onPress={()=>{this.searchTransactions(this.state.search)}}>
            <Text>
              SEARCH
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={this.state.allTransactions}
          renderItem={(item) => {
            <View style={{ borderBottomWidth: 2 }}>
              <Text>{"BOOK ID: " + item.BookID}</Text>
              <Text>{"STUDENT ID: " + item.StudentID}</Text>
              <Text>{"TRANSACTION TYPE: " + item.getTransaction}</Text>
              <Text>{"DATE: " + item.date.toDate()}</Text>
            </View>
          }}
          keyExtractor={(item, index) => { index.toString() }}
          onEndReached={this.fetchMoreTransactions}
          onEndReachedThreshold={0.7}
        >
        </FlatList>
      </View>
    );
  }

}
const styles = StyleSheet.create({ container: { flex: 1, marginTop: 20 }, searchBar:{ flexDirection:'row', height:40, width:'auto', borderWidth:0.5, alignItems:'center', backgroundColor:'grey', }, bar:{ borderWidth:2, height:30, width:300, paddingLeft:10, }, searchButton:{ borderWidth:1, height:30, width:50, alignItems:'center', justifyContent:'center', backgroundColor:'green' } })