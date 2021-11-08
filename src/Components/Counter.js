import React from 'react';
// import { useState } from "react";
import { Button } from "reactstrap";

// export default function Counter() {
//   //1-dars bu hookslar bilan ishlash usuli ya'ni useState va setState yoki setState o'zgartirish

//   const [count, setCount] = useState(0); // <= boshlang'ich qiymat => initial state
//   // console.log(c);

//   function inc() {
//     setCount((prev) => prev + 1);
//   }
//   ///////ikki xil usulda yozsa bo'ladi prev yoki - 1
//   function dec() {
//     setCount(count - 1);
//   }
//   return (
//     <div>
//       <h3>Count: {count} </h3>

//       <Button onClick={inc} color="success mx-2">
//         +
//       </Button>

//       <Button onClick={dec} color="danger mx-2">
//         -
//       </Button>
//       {/* // bu oddiy usul //////////////////////

// // // let count = 0;
// // function inc() {
// //   count += 1;
// //   console.log(count);
// // }
// // function dec() {
// //   count -= 1;
// //   console.log(count);
// // } */}
//     </div>
//   );
// }

// 1-usul rafce ya'ni function orqali qilish mumkin

// import React from 'react'

// const Toggle = () => {
//   return (
//     <div>

//     </div>
//   )
// }

// export default Toggle

// 2-usul Class orqali ko'proq yozishga to'g'ri keladi

// import React from 'react'

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
    this.increment = this.increment.bind(this)
    this.decrement = this.decrement.bind(this)
  }

  increment(){
    this.setState({count: this.state.count + 1})
  }
  decrement(){
    this.setState({count: this.state.count - 1})
  }

  render() {
    return (
      <div>
        <h1>Count: {this.state.count}</h1>
        <Button onClick={this.increment} color="success mx-2">
          +
        </Button>

        <Button onClick={this.decrement} color="danger mx-2">
          -
        </Button>
      </div>
    );
  }
}

export default Counter


// Hookilar => uzi foydalnish ya'ni 'use'-bilan boshlanadi useState , useEffect , useRef , useMemo , useContext bor va hokazo...