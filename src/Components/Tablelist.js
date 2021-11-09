import React from "react";
// import { useState } from "react";
import TableHeader from "./TableHeader";
import TableItem from "./TableItem";

const Tablelist = ({posts, title,remove}) => {

  if(!posts.length){
    return <h6 className='text-center my-5'>Not Found</h6>
  }

  return (
    <>
      <h5 className="text-center">{title}</h5>
      <table className="table table-striped">
        <TableHeader />
        <tbody>
          {/* <Darsfourtable title={'Pyhton'} stack={'Full-stack'}/> birinchi usuli */}

          {/* //ikkinchi mavzu */}
          {/* <Darsfourtable post={{id:1, title:'Pyhton', stack:'Full-stack'}}/>  */}

          {posts.map((post,index )=> (
            <TableItem remove={remove} number={index+1} post={post} key={post.id} />
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Tablelist;
