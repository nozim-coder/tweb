// import logo from './logo.svg';
import './App.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Facebook } from 'react-content-loader'
// import { Code } from 'react-content-loader'
// import ContentLoader from 'react-content-loader';
import { Button } from 'reactstrap';

function App() {
  // const MyCodeLoader = () => <Code />

  // const MyLoader = () => (
  //   <ContentLoader
  //     height={140}
  //     speed={1}
  //     backgroundColor={'#333'}
  //     foregroundColor={'#999'}
  //     viewBox="0 0 380 70"
  //   >
  //     {/* Only SVG shapes */}
  //     <rect x="0" y="0" rx="5" ry="5" width="70" height="70" />
  //     <rect x="80" y="17" rx="4" ry="4" width="300" height="13" />
  //     <rect x="80" y="40" rx="3" ry="3" width="250" height="10" />
  //   </ContentLoader>
  // )
  // const MyFacebookLoader = () => <Facebook />
  


  return (
    <div className="App">
      <h3>Count: </h3>
      <Button color="danger">+Button</Button>
      <Button color="success">+Click</Button>

      










      {/* <MyLoader/> */}
      {/* <MyFacebookLoader /> */}
      {/* <MyCodeLoader/> */}


    </div>
  );
}

export default App;
