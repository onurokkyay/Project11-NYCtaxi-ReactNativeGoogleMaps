import {
  SafeAreaView,
  ScrollView,
  textarea,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
} from 'react-native';

import firebase from '@react-native-firebase/app'
import React, { Component } from 'react';
import firestore from '@react-native-firebase/firestore';
import { FireSQL } from 'firesql';
import 'firebase/firestore';
//import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
const dbRef = firebase.firestore();
const fireSQL = new FireSQL(dbRef);
class Day {
  constructor(day, passengersum,faresum,trips) {
    this.day = day; //Ayın hangi günü örnek 1,2,15
    this.passengersum = passengersum; //Toplam kişi sayısı
    this.faresum = faresum; //Toplam ücret
    this.trips = trips;     //Sefer sayısı
    this.avgfare=faresum/trips;  //Ortalama ücret
    this.loaded=false;
  }
}
class Location {
  constructor(longitude,latitude){
      this.latitude=latitude;
      this.longitude=longitude;
  }
}
var Locations=[4];
//const origin = { latitude: 42.2678176, longitude: -71.000124 };
//const origin1 = { latitude: 43.01, longitude: -72.000124 }; // Bizim ev latitude 41.02869444 longtitude 29.09027778
//const origin1 = { latitude: 41.02869444, longitude: 29.09027778 };
const olddestination = { latitude: 42.2929175, longitude: -71.0548235 };
//const destination1 = { latitude: 43.2929175, longitude: -71.0548235 }; //Canpark lat 41.02455556 long 29.10611111
//const destination1 = { latitude: 41.02455556, longitude: 29.10611111 };
const GOOGLE_MAPS_APIKEY = 'xxx';
var Days=[];
var Trips=[];
var locationschanged=false;
 class App extends React.Component {
   
constructor(props) {
  super(props)
  this.state = {
    type1:"",
    type2:"",
    type3:"",
   // origin : { latitude: 42.2678176, longitude: -71.000124 },
   // destination : { latitude: 42.2929175, longitude: -71.0548235 },
   origin: null,
   destination: null,
    origin1 : null,
    destination1 : null,
  }
}


  componentDidMount(){
    type1Change = e => {
      this.setState({type1: e})
    }
    type2Change = e => {
      this.setState({type2: e})
    }
    type3Change = e => {
      this.setState({type3: e})
    }
    originChange = e => {
      this.setState({origin: e})
     
    }
    destinationChange = e => {
      this.setState({destination: e})
    }
    origin1Change = e => {
      this.setState({origin1: e})
      //console.log("origin 1 değişti lat"+this.state.origin1.latitude+" longi"+this.state.origin1.longitude);
    }
    destination1Change = e => {
      this.setState({destination1: e})
    }
    const {type1,type2,type3} =this.state;
    //console.log(this.state);
    const config = {
      apiKey: 'xxx',
      authDomain: 'xxx',
      databaseURL: 'xxx',
      projectId: 'xxx',
      storageBucket: 'xxx',
      messagingSenderId: 'xxx',
      appId: "xxx",
      };
      if (!firebase.apps.length) {
      firebase.initializeApp(config);
       } 
       
  var passengersums=[];
  for (let i = 0; i < 24; i++) {
    passengersums[i]=0;
  }
  var counts=[];
  for (let i = 1; i < 24; i++) {
    counts[i]=0;
  }
  var faresums=[];
  for (let i = 1; i < 24; i++) {
    faresums[i]=0;
  }

async function typequery() {
//SELECT EXTRACT(DAY FROM tpep_pickup_datetime),sum(passenger_count) FROM rntaxi-4436c.tripdata.trips GROUP BY EXTRACT(DAY FROM tpep_pickup_datetime) ORDER by sum(passenger_count) DESC limit 15  
await firestore()
.collection('tripdata')
.get()
.then(querySnapshot => {
  querySnapshot.forEach(documentSnapshot => {
    if(documentSnapshot.data().passenger_count!=undefined){
    var str=documentSnapshot.data().tpep_pickup_datetime.toString();
    var res=str.split(" ");
    var dayfull=res[0].split("-");
    day=dayfull[2];
    daylast=day.split('0');
    if(day==10 || day==20 || day==30){
      passengersums[day]+=documentSnapshot.data().passenger_count;
      counts[day]+=1;
      faresums[day]+=documentSnapshot.data().total_amount;
    }
    else if(daylast[1]!=undefined){
      passengersums[daylast[1]]+=documentSnapshot.data().passenger_count;
      counts[daylast[1]]+=1;
      faresums[daylast[1]]+=documentSnapshot.data().total_amount;
    }
    else {
      passengersums[day]+=documentSnapshot.data().passenger_count;
      counts[day]+=1;
      faresums[day]+=documentSnapshot.data().total_amount;
    }
    
    if(documentSnapshot.data().passenger_count>=3 && documentSnapshot.data().trip_distance > 0){
      if(documentSnapshot.data().DOLocationID < 264 && documentSnapshot.data().PULocationID< 264){
        if(documentSnapshot.data().DOLocationID!=documentSnapshot.data().PULocationID)
        Trips.push(documentSnapshot);
      }
     
    }
    }

  });
});
//Tip 1 sorgu
/*console.log("Toplam kişi sayıları:")
for (let i = 1; i < passengersums.length; i++) {
      console.log("Gün: "+i+" Toplam kişi sayısı:"+passengersums[i]);
  
} */

//Tip 1+2 sorgu 
console.log("Ücret ortalamaları:")
for (let i = 1; i < faresums.length; i++) {
  console.log("Gün: "+i+"       Toplam kişi sayısı: "+passengersums[i]+"      Toplam ücret: "+faresums[i]+"      Sefer sayısı: "+counts[i]);
  var avgfare=faresums[i]/counts[i];
    console.log(" Ortalama ücret: "+avgfare);
   Days.push(new Day(i,passengersums[i],faresums[i],counts[i]))
}



//Yolcu sayısına göre sıralama yapalım
function bubble_Sort_passengers(a)
{
    var swapp;
    var n = a.length-1;
    var x=a;
    do {
        swapp = false;
        for (var i=0; i < n; i++)
        {
            if (x[i].passengersum < x[i+1].passengersum)
            {
               var temp = x[i];
               x[i] = x[i+1];
               x[i+1] = temp;
               swapp = true;
            }
        }
        n--;
    } while (swapp);
 return x; 
}
//Yolcu sayısına göre sıralanmış hali
 bubble_Sort_passengers(Days);
//Tip 1 sorgunun cevabı
console.log("=========================En yüksek yolcu sayısına sahip ilk 5 gün  ! Tip 1 Sorgu 1 !=========================")
var type1str="En yüksek yolcu sayısına sahip ilk 5 gün  ! Tip 1 Sorgu 1 !\n";
for (let i = 0; i <5; i++) {
  var stx="Gün :"+Days[i].day+"\n Toplam yolcu sayısı: "+Days[i].passengersum+"\n Toplam ücret: "+Days[i].faresum+"\n Sefer sayısı: "+Days[i].trips+"\n Ortalama ücret: "+Days[i].avgfare+"\n";
    console.log(Days[i]);
    type1str+=stx;
}
type1Change(type1str);
function bubble_Sort_avgfares(a)
{
    var swapp;
    var n = a.length-1;
    var x=a;
    do {
        swapp = false;
        for (var i=0; i < n; i++)
        {
            if (x[i].avgfare > x[i+1].avgfare)
            {
               var temp = x[i];
               x[i] = x[i+1];
               x[i+1] = temp;
               swapp = true;
            }
        }
        n--;
    } while (swapp);
 return x; 
}

//Tip 2 sorgu
//Ortalama ücrete göre sıralanacak,ilk 2 sinin arasındaki günleri yazdıracağız
bubble_Sort_avgfares(Days)
console.log("=========================En az ücret alınan ilk 2 gün========================= ")
var type2str="En az ücret alınan ilk 2 gün ! Tip 2 Sorgu 2 !\n";
for (let i = 0; i <2; i++) {
  var stx="Gün :"+Days[i].day+"\n Toplam yolcu sayısı: "+Days[i].passengersum+"\n Toplam ücret: "+Days[i].faresum+"\n Sefer sayısı: "+Days[i].trips+"\n Ortalama ücret: "+Days[i].avgfare+"\n";
    console.log(Days[i]);
    type2str+=stx;
}

var dayfirst=0;
var daylast=0;
if(Days[0].day<Days[1].day){
    dayfirst=Days[0].day;
    daylast=Days[1].day;
}
else {
  dayfirst=Days[1].day;
  daylast=Days[0].day;
}
//Önce days dizisini tekrar günlere göre sıralayalım
function bubble_Sort_Days(a)
{
    var swapp;
    var n = a.length-1;
    var x=a;
    do {
        swapp = false;
        for (var i=0; i < n; i++)
        {
            if (x[i].day > x[i+1].day)
            {
               var temp = x[i];
               x[i] = x[i+1];
               x[i+1] = temp;
               swapp = true;
            }
        }
        n--;
    } while (swapp);
 return x; 
}
bubble_Sort_Days(Days);
//En az ücret alınan 2 gün
console.log("Dayfirst :"+dayfirst+" Daylast:"+daylast);
//Tip 2 sorgunun cevabı
console.log("=========================En az ücret alınan 2 gün arasındaki günler ve ortalama alınan ücret (avgfare)  ! Tip 2 Sorgu 2 !=========================") //Şu an yazdırmaya en az ücret alınan 2 gün de dahil arasındakiler+kendileri
type2str+="\n Arasındaki günler:\n"
for (let i = dayfirst+1; i < daylast; i++) {
  var stx="Gün :"+Days[i-1].day+"\n Toplam yolcu sayısı: "+Days[i-1].passengersum+"\n Toplam ücret: "+Days[i-1].faresum+"\n Sefer sayısı: "+Days[i-1].trips+"\n Ortalama ücret: "+Days[i-1].avgfare+"\n";
      console.log(Days[i-1]); // 1.gün dizide 0.gün olduğu için -1
      type2str+=stx;
}

type2Change(type2str)
//console.log(Trips);
//Mesafeye göre sırala
function bubble_Sort_Distance(a)
{
    var swapp;
    var n = a.length-1;
    var x=a;
    do {
        swapp = false;
        for (var i=0; i < n; i++)
        {
            if (x[i].data().trip_distance < x[i+1].data().trip_distance)
            {
               var temp = x[i];
               x[i] = x[i+1];
               x[i+1] = temp;
               swapp = true;
            }
        }
        n--;
    } while (swapp);
 return x; 
}
bubble_Sort_Distance(Trips);
console.log("=========================3 veya daha fazla yolcu içeren tripler=========================");
for (let i = 0; i < Trips.length; i++) {
  //pickup dropoff
  console.log("Trip DOLocationID: "+Trips[i].data().DOLocationID+" Trip PULocation"+Trips[i].data().PULocationID+"Trip Distance: "+Trips[i].data().trip_distance+" Passenger Count: "+Trips[i].data().passenger_count);
}

console.log("=========================Tip 3 sorgu 3=========================");
console.log("En az 3 yolcuya sahip triplerden En uzun mesafeli tripin mesafesi:"+Trips[0].data().trip_distance+" DOLocationid:"+Trips[0].data().DOLocationID+" PULocationid:"+Trips[0].data().PULocationID);
console.log("En az 3 yolcuya sahip triplerden kısa mesafeli tripin mesafesi :"+Trips[Trips.length-1].data().trip_distance+" DOLocationid:"+Trips[Trips.length-1].data().DOLocationID+" PULocationid:"+Trips[Trips.length-1].data().PULocationID)
var trip0originzone=Trips[0].data().DOLocationID;
var trip0destinationzone=Trips[0].data().PULocationID;
var trip1originzone=Trips[Trips.length-1].data().DOLocationID;
var trip1destinationzone=Trips[Trips.length-1].data().PULocationID;
var type3str="En kısa ve en uzun yolculuk! Tip 3 Sorgu 3 !\n";
console.log("TRIP1ORIGINZONE"+trip1originzone);
await firestore()
.collection('taxizones')
.get()
.then(querySnapshot => {
  querySnapshot.forEach(documentSnapshot => {
        if(documentSnapshot.data().LocationID==trip0originzone){
            Locations[0]=new Location(documentSnapshot.data().longitude,documentSnapshot.data().latitude);
            console.log("En uzun trip başlangıç Locationid:"+documentSnapshot.data().LocationID+" Zone: "+documentSnapshot.data().zone+" Latitude"+documentSnapshot.data().latitude+" Longitude"+documentSnapshot.data().longitude)
            type3str+="En uzun trip başlangıç Locationid:"+documentSnapshot.data().LocationID+" Zone: "+documentSnapshot.data().zone+" Latitude"+documentSnapshot.data().latitude+" Longitude"+documentSnapshot.data().longitude+"\n";
          }
        if(documentSnapshot.data().LocationID==trip0destinationzone){
          Locations[1]=new Location(documentSnapshot.data().longitude,documentSnapshot.data().latitude);
          console.log("En uzun trip bitiş Locationid:"+documentSnapshot.data().LocationID+" Zone: "+documentSnapshot.data().zone+" Latitude"+documentSnapshot.data().latitude+" Longitude"+documentSnapshot.data().longitude)
          type3str+="En uzun trip bitiş Locationid:"+documentSnapshot.data().LocationID+" Zone: "+documentSnapshot.data().zone+" Latitude"+documentSnapshot.data().latitude+" Longitude"+documentSnapshot.data().longitude+"\n";
        }
      if(documentSnapshot.data().LocationID==trip1originzone){
        Locations[2]=new Location(documentSnapshot.data().longitude,documentSnapshot.data().latitude);
        console.log("En kısa trip başlangıç DOLocationid:"+documentSnapshot.data().LocationID+" Zone: "+documentSnapshot.data().zone+" Latitude"+documentSnapshot.data().latitude+" Longitude"+documentSnapshot.data().longitude)
        type3str+="En kısa trip başlangıç DOLocationid:"+documentSnapshot.data().LocationID+" Zone: "+documentSnapshot.data().zone+" Latitude"+documentSnapshot.data().latitude+" Longitude"+documentSnapshot.data().longitude+"\n";
      }
    if(documentSnapshot.data().LocationID==trip1destinationzone){
      Locations[3]=new Location(documentSnapshot.data().longitude,documentSnapshot.data().latitude);
      console.log("En kısa trip bitiş PULocationid:"+documentSnapshot.data().LocationID+" Zone: "+documentSnapshot.data().zone+" Latitude"+documentSnapshot.data().latitude+" Longitude"+documentSnapshot.data().longitude)
      type3str+="En kısa trip bitiş PULocationid:"+documentSnapshot.data().LocationID+" Zone: "+documentSnapshot.data().zone+" Latitude"+documentSnapshot.data().latitude+" Longitude"+documentSnapshot.data().longitude+"\n";
    }
  }
  );
});
//this.prop
   async function changelocations(){
    originChange(Locations[0]);
    destinationChange(Locations[1]);
    origin1Change(Locations[2]);
    //console.log("type3str :"+type3str);
    type3Change(type3str);
    destination1Change(Locations[3]);
  }
  await changelocations();
  locationschanged=true;  
}

typequery(type1,type2,type3,type1Change,type2Change,type3Change);

}


  render() {
    return (
      <ScrollView>
<View style={styles.container}>

{this.state.origin!==null && this.state.origin1!==null && this.state.destination!==null && this.state.destination1!==null     ? (
  <MapView style={styles.map}  initialRegion={{
    latitude: 40.730610,
    longitude: -73.935242,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  }}>
  <MapViewDirections
    origin={this.state.origin} //The origin location to start routing from.
    destination={this.state.destination}  //The destination location to start routing to.
    apikey={GOOGLE_MAPS_APIKEY}
    strokeWidth={5}
    strokeColor="hotpink"
  />
   <MapViewDirections
    origin={this.state.origin1} //The origin location to start routing from.
    destination={this.state.destination1}   //The destination location to start routing to.
    strokeWidth={5}
    strokeColor="red"
    apikey={GOOGLE_MAPS_APIKEY}
  />
</MapView>
) : (
  <Text>Map yükleniyor...</Text>
)}

</View>

<View>
<Text>{Days[1] === undefined ? (
  <Text>Sorgu 3 yükleniyor</Text>
)  : (
  <Text>{this.state.type3}
    </Text>
)
}</Text>
</View>


<View>

<Text>{Days[1] === undefined ? (
  <Text>Sorgu 1 yükleniyor</Text>
)  : (
  <Text>{this.state.type1}
    </Text>
)
}</Text>

<Text>{Days[1] === undefined ? (
  <Text>Sorgu 2 yükleniyor</Text>
)  : (
  <Text>{this.state.type2}
    </Text>
)
}</Text>

</View>
      </ScrollView>
     
  
    
    );
  }
}
const styles = StyleSheet.create({
  container: {
  
    height: 350,
    width: 420,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
 });
export default App;
