import React from 'react'
import { useState } from "react";

export default function Targeven() {

  const [value, setValue] = useState("Sam");

  return (
    <div>
      {/* // 3-dars onChange={event=> console.log(event) */}

      <p> Value: {value}</p>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        type="text"
        className="form-control"
      />
    </div>
  );
}
