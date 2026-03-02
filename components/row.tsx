import { twMerge } from "tailwind-merge";
import { Flex } from "./base";

const Row = ({ children, className, ...props }) => {
  const finalClassNames = twMerge("flex-wrap", className ?? "")

  return (
    <Flex className={finalClassNames} {...props}>
      {children}
    </Flex>
  )
};

export default Row;
