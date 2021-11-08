import { useState } from "react";
import { Button } from "reactstrap";

export default function Toggle() {
  const [toggleBtn, setToggleBtn] = useState(false);

  return (
    <div>
      {/* // 2-dars Toggle haqida onClick={()=> setToggleBtn (!toggleBtn)} */}

      <Button onClick={() => setToggleBtn(!toggleBtn)} className="secondary my-2">
        Toggle btn
      </Button>
      {toggleBtn ? <p className="lead">YouTube Content</p> : null}
    </div>
  );
}


