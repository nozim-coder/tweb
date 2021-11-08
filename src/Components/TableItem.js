import React from "react";
import MyButon from "./UI/button/MyButon";

const TableItem = (props) => { 
    // console.log(props);
  return (
      <tr>
        <th scope="row">{props.number}</th>
        <td>{props.post.title}</td>
        <td>{props.post.stack}</td>
        <td>
          <MyButon onClick={()=> props.remove(props.post)}>
            Delete
          </MyButon>
          {/* <button className="btn btn-outline-danger">Delete</button> */}
        </td>
      </tr>
    //   {/* <tr>
    //         <th scope="row">2</th>
    //         <td>Jacob</td>
    //         <td>Thornton</td>
    //         <td>@fat</td>
    //       </tr>
    //       <tr>
    //         <th scope="row">3</th>
    //         <td colspan="2">Larry the Bird</td>
    //         <td>@twitter</td>
    //       </tr> */}
  );
};

export default TableItem;
