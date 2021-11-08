import React, { useState } from "react";
import MyButon from "./UI/button/MyButon";
import MyInput from "./UI/input/MyInput";

const PostForm = ({ createPost }) => {
  // bu birinchi ususli //////////////////////////////////////////////////////////////////

  //   const [title, setTitle] = useState("");
  //   const [stack, setStack] = useState("");

  // {/* <form>
  //         <h5 className="text-center my-3">Create your first post</h5>
  //         {/* Boshqarib bo'ladigan */}
  //         <MyInput
  //           type="text"
  //           className="form-control"
  //           placeholder="Programming Language"
  //           value={title}
  //           onChange={(e) => setTitle(e.target.value)}
  //         />
  //         {/* <input type="text" ref={inputRef}/> */}

  //         {/* Boshqarib bulmaydigan input- formalar */}
  //         <MyInput
  //           type="text"
  //           className="form-control my-3"
  //           placeholder="Enter your favourite stack"
  //           value={stack}
  //           onChange={(e) => setStack(e.target.value)}
  //         />
  //         <MyButon onClick={addPost}>Add post</MyButon>
  //       </form> */}

  // const addPost = (e) => {
  //     e.preventDefault();
  //     const newPost = {
  //         ...post,
  //         id:Date.now()
  //     }
  //     createPost(newPost)

  //     // const newPost ={
  //     //   id:Date.now(),
  //     //   title,
  //     //   stack
  //     // }

  //     // setposts([...posts, newPost])
  //     setTitle('')
  //     setStack('')
  //     // console.log(title);
  //   };

  // bu ikkinchi usuli ///////////////////////////////////////////////////////////////////

  const [post, setPost] = useState({ title: "", stack: "" });

  // <MyInput
  //   type="text"
  //   className="form-control"
  //   placeholder="Programming Language"
  //   value={post.title}
  //   onChange={(e) => setPost({...props, title: e.target.value})}
  // />
  // {/* <input type="text" ref={inputRef}/> */}

  // {/* Boshqarib bulmaydigan input- formalar */}
  // <MyInput
  //   type="text"
  //   className="form-control my-3"
  //   placeholder="Enter your favourite stack"
  //   value={post.stack}
  //   onChange={(e) => setPost({...props, stack: e.target.value})}
  // />

  // const addPost = (e) => {
  //   e.preventDefault();
  //   setposts([...posts,{...post, id:Date.now() }])
  //   setPost({title: '' , stack: ''})

  // };

  ///////////////////////////////////////////////////////////////////////////////

  const addPost = (e) => {
    e.preventDefault();
    const newPost = {
      ...post,
      id: Date.now(),
    };
    createPost(newPost);
    setPost({ title: "", stack: "" });
    // console.log(title);
  };

  return (
    <form>
      <h5 className="text-center my-3">Create your first post</h5>
      {/* Boshqarib bo'ladigan */}
      <MyInput
        type="text"
        className="form-control"
        placeholder="Programming Language"
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
      />
      {/* <input type="text" ref={inputRef}/> */}

      {/* Boshqarib bulmaydigan input- formalar */}
      <MyInput
        type="text"
        className="form-control my-3"
        placeholder="Enter your favourite stack"
        value={post.stack}
        onChange={(e) => setPost({ ...post, stack: e.target.value })}
      />
      <MyButon onClick={addPost}>Add post</MyButon>
    </form>
  );
};

export default PostForm;
