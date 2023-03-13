import React, { useMemo } from "react";
import "./app.global.scss";
interface IndexProps {
  name: string;
}
const Index: React.FC<IndexProps> = ({ name }) => {
  return useMemo(() => <div className="color">{name}</div>, []);
};
export default Index;
