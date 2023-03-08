import React, { useMemo } from "react";
import "./app.css";
interface IndexProps {
  name: string;
}
const Index: React.FC<IndexProps> = ({ name }) => {
  return useMemo(
    () => (
      <div className="color">
        {name}
        <input type="text" className="input" />
      </div>
    ),
    []
  );
};
export default Index;
