// FilterForm.js
import React from "react";
import { Form } from "react-bootstrap";

const SortForm = ({ Sort, setSort }) => {
  return (
    <Form className="SortContainer">
      <Form.Group className="">
        <Form.Label>Sort</Form.Label>
        <Form.Control
          className="Sort"
          as="select"
          value={ Sort }
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="Default">Default</option>
          <option value="Category Asc">Category Asc</option>
          <option value="Category Dsc">Category Dsc</option>
          <option value="Location Asc">Location Asc</option>
          <option value="Location Dsc">Location Dsc</option>
          <option value="Price Asc">Price Asc</option>
          <option value="Price Dsc">Price Dsc</option>
          <option value="A-Z">A-Z</option>
          <option value="Z-A">Z-A</option>
        </Form.Control>
      </Form.Group>
    </Form>
  );
};

export default SortForm;
