import React from "react";
import { Form } from "react-bootstrap";

const SortForm = ({ Sort, setSort }) => {
  return (
    <Form className="sort-container">
      <Form.Group>
        <Form.Label>Sort</Form.Label>
        <Form.Control
          as="select"
          value={Sort}
          onChange={(e) => setSort(e.target.value)}
          className="sort-select"
        >
          <option value="Default">Default</option>
          <option value="Category Asc">Category Asc</option>
          <option value="Category Dsc">Category Dsc</option>
          <option value="Location Asc">Location Asc</option>
          <option value="Location Dsc">Location Dsc</option>
          <option value="Price Asc">Price Asc</option>
          <option value="Price Dsc">Price Dsc</option>
          <option value="Name Asc">A-Z</option>
          <option value="Name Dsc">Z-A</option>
        </Form.Control>
      </Form.Group>
    </Form>
  );
};

export default SortForm;
