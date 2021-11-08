import React from "react";
import MyInput from "./UI/input/MyInput";
import MySelect from "./UI/Select/MySelect";

const FilterAndSearch = ({filter, setFilter}) => {
  return (
    <div className="d-flex justify-content-between my-2">
      <MyInput
        className="form-control"
        value={filter.query}
        onChange={ e => setFilter({...filter, query:e.target.value})}
        type="search"
        placeholder="Search..."
      />

      <MySelect
        value={filter.sort}
        onChange={selected=>setFilter({...filter,sort:selected})}
        defaultValue="Sorted by"
        options={[
          { value: "title", name: "Sorted by Programming" },
          { value: "stack", name: "Sorted by Jobs" },
        ]}
      />
    </div>
  );
};

export default FilterAndSearch;
