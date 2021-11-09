import React, { useMemo, useState } from "react";
import "./App.css";
import FilterAndSearch from "./Components/FilterAndSearch";
import PostForm from "./Components/PostForm";
import Tablelist from "./Components/Tablelist";

// import 'bootstrap/dist/css/bootstrap.min.css';  // <= boottsrapni boshqa xil ulash usuli yoki shu yerdan import qilamiz yoki index.html dan cherez link chaqirib olamiz
// import Counter from "./Components/Counter";
// import Targeven from "./Components/Targeven";
// import ReactContentLoader from "./Components/ReactContentLoader";
// import Toggle from "./Components/Toggle";

function App() {
  const [posts, setposts] = useState([
    { id: 1, title: "Pyhton", stack: "MERN stack" },
    { id: 2, title: "JavaScript", stack: "Cyber-stack" },
    { id: 3, title: "Go", stack: "Full-stack" },
    { id: 4, title: "Java", stack: "Backend" },
  ]);

  // const [select, setSelect] = useState("");
  // const [search, setSearch] = useState("");

  const [filter, setFilter] = useState({ sort: "", query: "" });

  const sortedPosts = useMemo(() => {
    console.log("render");
    if (filter.sort) {
      return [...posts].sort((a, b) =>
        a[filter.sort].localeCompare(b[filter.sort])
      );
    }
    return posts;
  }, [filter.sort, posts]);

  const sortedAndSearchPosts = useMemo(() => {
    return sortedPosts.filter((post) =>
      post.title.toLowerCase().includes(filter.query.toLowerCase())
    );
  }, [filter.query, sortedPosts]);

  // const sortPost = (sort) => {
  //   setSelect(sort);
  //   // console.log(sort);
  //   // setposts([...posts].sort((a, b) => a[sort].localeCompare(b[sort])));
  // };

  // const [posts2, setposts2] = useState([
  //   { id: 1, title: "HTML", stack: "Template " },
  //   { id: 2, title: "CSS", stack: "Animation" },
  //   { id: 3, title: "Bootstrap", stack: "Theme" },
  //   { id: 4, title: "Sass", stack: "Styles" },
  // ]);

  const createPost = (newPost) => {
    setposts([...posts, newPost]);
  };
  const removePost = (post) => {
    setposts(posts.filter((s) => s.id !== post.id));
  };

  return (
    // className="App"
    <div>
      {/* <Counter />
        <Toggle />
        <Targeven/>
        <ReactContentLoader/> */}
        {/* <h1>Hello Github in Uzbekistan</h1> */}
      <div className="apps w-50 mx-auto">
        <PostForm createPost={createPost} />
        <FilterAndSearch filter={filter} setFilter={setFilter} />
        <Tablelist
          remove={removePost}
          posts={sortedAndSearchPosts}
          title="Programming language"
        />
      </div>
      {/* <div className="apps w-50 mx-auto">
      //   <Tablelist posts={posts2} title="Free Courses" />
      // </div> */}
    </div>
  );
}

export default App;

// {
//   /* <script src="http://localhost:8097"></script> */
// }
// {
//   /* <script src="http://192.168.1.2:8097"></script> */
// }
// port: 8097

// Bu useReflar bilan ishlash

// import React, { useRef } from "react";

// const inputRef = useRef();

// const addPost = (e) => {
//   e.preventDefault();
//   console.log(title);
//   console.log(inputRef.current.value);
// };

// const MyInput = React.forwardRef((props, ref) => {
//   return <input {...props} ref={ref} />;
// });

// {
//   /* <MyInput
//   ref={inputRef}
//   type="text"
//   className="form-control my-3"
//   placeholder="Enter your favourite stack"
// />; */
// }
